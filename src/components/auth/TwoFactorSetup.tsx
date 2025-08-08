import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Copy, Check, AlertCircle, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { encrypt, decrypt } from "@/lib/encryption";
import { emailNotificationService } from "@/services/emailNotifications";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

interface TwoFactorSetupProps {
  onSetupComplete: (enabled: boolean) => void;
  currentlyEnabled: boolean;
}

export function TwoFactorSetup({ onSetupComplete, currentlyEnabled }: TwoFactorSetupProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup-codes'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  const generateTOTPSecret = async () => {
    try {
      // Generate a random secret
      const newSecret = new OTPAuth.Secret({ size: 20 });
      const base32Secret = newSecret.base32;
      
      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: 'EzJob',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: base32Secret,
      });

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(totp.toString());
      
      setSecret(base32Secret);
      setManualEntryKey(base32Secret);
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      toast.error('Failed to generate 2FA setup');
    }
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character backup codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleSetup = async () => {
    setLoading(true);
    setStep('setup');
    await generateTOTPSecret();
    setLoading(false);
    setIsOpen(true);
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    
    try {
      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: 'EzJob',
        label: user?.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      const delta = totp.validate({ 
        token: verificationCode, 
        window: 1 // Allow 1 step tolerance (30 seconds before/after)
      });

      if (delta === null) {
        toast.error('Invalid verification code. Please try again.');
        return;
      }

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Encrypt the secret and backup codes before storing
      const encryptedSecret = encrypt(secret);
      const encryptedBackupCodes = codes.map(code => encrypt(code));

      // Store encrypted data in the database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          totp_secret_encrypted: encryptedSecret,
          totp_backup_codes: encryptedBackupCodes,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: true,
        }
      });

      if (authError) {
        throw authError;
      }

      // Send notification email
      try {
        await emailNotificationService.sendTwoFactorEnabledEmail(
          user?.email || '',
          user?.user_metadata?.full_name || 'User'
        );
      } catch (emailError) {
        console.warn('Failed to send 2FA enabled email:', emailError);
      }

      toast.success('Two-factor authentication enabled successfully!');
      setStep('backup-codes');

    } catch (error: any) {
      toast.error(error.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    
    try {
      // Clear encrypted data from database
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update({
          totp_secret_encrypted: null,
          totp_backup_codes: null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', user?.id);

      if (profileError) {
        throw profileError;
      }

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: false,
        }
      });

      if (authError) {
        throw authError;
      }

      toast.success('Two-factor authentication disabled');
      onSetupComplete(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, message: string, setCopiedState: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      toast.success(message);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    copyToClipboard(codesText, 'Backup codes copied to clipboard', setBackupCodesCopied);
  };

  const resetForm = () => {
    setStep('setup');
    setVerificationCode('');
    setSecret('');
    setManualEntryKey('');
    setQrCodeUrl('');
    setBackupCodes([]);
  };

  const handleNext = () => {
    setStep('verify');
  };

  const handleComplete = () => {
    onSetupComplete(true);
    setIsOpen(false);
    resetForm();
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account with encrypted TOTP secrets
        </p>
        {currentlyEnabled && (
          <Badge variant="default" className="bg-success text-success-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Enabled & Encrypted
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        {currentlyEnabled ? (
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={loading}
          >
            {loading ? "Disabling..." : "Disable 2FA"}
          </Button>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleSetup} disabled={loading}>
                <Shield className="h-4 w-4 mr-2" />
                {loading ? "Setting up..." : "Enable 2FA"}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {step === 'setup' && 'Set up Two-Factor Authentication'}
                  {step === 'verify' && 'Verify Your Setup'}
                  {step === 'backup-codes' && 'Save Your Backup Codes'}
                </DialogTitle>
                <DialogDescription>
                  {step === 'setup' && 'Scan the QR code with your authenticator app'}
                  {step === 'verify' && 'Enter the verification code from your authenticator app'}
                  {step === 'backup-codes' && 'Save these backup codes in a secure location'}
                </DialogDescription>
              </DialogHeader>

              {step === 'setup' && (
                <div className="space-y-6">
                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    </div>
                  )}

                  {/* Manual Entry */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Can't scan? Enter this key manually:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={manualEntryKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(manualEntryKey, 'Secret key copied to clipboard', setCopied)}
                        className="shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Instructions:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                        <li>Scan the QR code or enter the key manually</li>
                        <li>Click "Next" to verify your setup</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNext}>
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {step === 'verify' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="verification-code">
                      Enter the 6-digit code from your authenticator app:
                    </Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      The code changes every 30 seconds. If it doesn't work, wait for a new code and try again.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setStep('setup')}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleVerifyAndEnable} 
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? "Verifying..." : "Enable 2FA"}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'backup-codes' && (
                <div className="space-y-6">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> These backup codes can be used to access your account if you lose your authenticator device. 
                      Store them in a secure location - they will only be shown once.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Backup Codes:</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyBackupCodes}
                      >
                        {backupCodesCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copy All
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="text-center py-1">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleComplete}>
                      I've Saved My Backup Codes
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default TwoFactorSetup;
