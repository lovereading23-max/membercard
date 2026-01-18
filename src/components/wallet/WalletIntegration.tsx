'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Wallet, 
  Apple, 
  Chrome, 
  Download, 
  Share2, 
  CheckCircle,
  AlertCircle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletIntegrationProps {
  card: any;
}

export default function WalletIntegration({ card }: WalletIntegrationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [googleWalletUrl, setGoogleWalletUrl] = useState<string | null>(null);
  const [appleWalletUrl, setAppleWalletUrl] = useState<string | null>(null);

  const generateGoogleWalletPass = async () => {
    setIsGenerating(true);
    try {
      // Simulate generating Google Wallet pass
      // In a real implementation, this would call your backend to generate a Google Wallet pass
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, create a mock Google Wallet URL
      const mockUrl = `https://pay.google.com/gp/v/save/${card.id}?card=${encodeURIComponent(card.name)}`;
      setGoogleWalletUrl(mockUrl);
      toast.success('Google Wallet pass generated successfully!');
    } catch (error) {
      console.error('Failed to generate Google Wallet pass:', error);
      toast.error('Failed to generate Google Wallet pass');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAppleWalletPass = async () => {
    setIsGenerating(true);
    try {
      // Simulate generating Apple Wallet pass
      // In a real implementation, this would call your backend to generate an Apple Wallet pass
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, create a mock Apple Wallet URL
      const mockUrl = `data:application/vnd.apple.pkpass;base64,${btoa(JSON.stringify({
        card: card,
        generated: new Date().toISOString()
      }))}`;
      setAppleWalletUrl(mockUrl);
      toast.success('Apple Wallet pass generated successfully!');
    } catch (error) {
      console.error('Failed to generate Apple Wallet pass:', error);
      toast.error('Failed to generate Apple Wallet pass');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCard = async () => {
    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent )) {
      try {
        await navigator.share({
          title: `${card.name} - Digital Business Card`,
          text: `Check out ${card.name}'s digital business card`,
          url: `${window.location.origin}/card/${card.id}`
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/card/${card.id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Card link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  const downloadGoogleWalletPass = () => {
    if (googleWalletUrl) {
      window.open(googleWalletUrl, '_blank');
    }
  };

  const downloadAppleWalletPass = () => {
    if (appleWalletUrl) {
      // For Apple Wallet, we need to trigger a download
      const link = document.createElement('a');
      link.href = appleWalletUrl;
      link.download = `${card.name}.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Digital Wallet Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Add your digital business card to Google Wallet or Apple Wallet for easy access and sharing.
            </AlertDescription>
          </Alert>

          {/* Google Wallet Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Chrome className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Google Wallet</h3>
              </div>
              {googleWalletUrl && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
            
            {!googleWalletUrl ? (
              <Button 
                onClick={generateGoogleWalletPass} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Add to Google Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button onClick={downloadGoogleWalletPass} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Wallet
                </Button>
                <Button 
                  onClick={() => setGoogleWalletUrl(null)} 
                  variant="outline" 
                  className="w-full"
                >
                  Regenerate Pass
                </Button>
              </div>
            )}
          </div>

          {/* Apple Wallet Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-gray-800" />
                <h3 className="font-semibold">Apple Wallet</h3>
              </div>
              {appleWalletUrl && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
            
            {!appleWalletUrl ? (
              <Button 
                onClick={generateAppleWalletPass} 
                disabled={isGenerating}
                className="w-full bg-black hover:bg-gray-800"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Add to Apple Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button onClick={downloadAppleWalletPass} className="w-full bg-black hover:bg-gray-800">
                  <Download className="w-4 h-4 mr-2" />
                  Download Apple Wallet Pass
                </Button>
                <Button 
                  onClick={() => setAppleWalletUrl(null)} 
                  variant="outline" 
                  className="w-full"
                >
                  Regenerate Pass
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              Share your digital business card with others through various methods.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={shareCard} variant="outline" className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Share2 className="w-6 h-6" />
                <span>Share via Device</span>
                <span className="text-xs text-muted-foreground">Native sharing</span>
              </div>
            </Button>

            <Button 
              onClick={() => {
                const url = `${window.location.origin}/card/${card.id}`;
                navigator.clipboard.writeText(url);
                toast.success('Card link copied to clipboard!');
              }} 
              variant="outline" 
              className="h-auto p-4"
            >
              <div className="flex flex-col items-center gap-2">
                <ExternalLink className="w-6 h-6" />
                <span>Copy Link</span>
                <span className="text-xs text-muted-foreground">Share URL</span>
              </div>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Card URL: {window.location.origin}/card/{card.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}