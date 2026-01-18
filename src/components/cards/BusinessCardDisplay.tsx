'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Share2,
  Download,
  QrCode,
  Eye,
  Calendar,
  MessageCircle,
  ExternalLink,
  Wallet,
  Smartphone,
  Facebook,
  MessageSquare,
  Twitter,
  Instagram,
  Linkedin,
  Chrome
} from 'lucide-react';
import QRCodeComponent from '@/components/ui/qr-code';
import WealthManagementCard from './WealthManagementCard';
import RealEstateCard from './RealEstateCard';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import WalletIntegration from '@/components/wallet/WalletIntegration';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';


interface BusinessCardDisplayProps {
  card: any;
  isOwner?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

// Default card display component
function DefaultBusinessCardDisplay({ 
  card, 
  isOwner = false, 
  onEdit, 
  onShare, 
  onSave 
}: BusinessCardDisplayProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showWalletIntegration, setShowWalletIntegration] = useState(false);
  const { language, setLanguage, t } = useLanguage();


  const getSocialIcon = (platform: string) => {
    const iconComponents: { [key: string]: React.ComponentType<any> } = {
      linkedin: Linkedin,
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      whatsapp: MessageSquare,
      wechat: MessageSquare,
      line: MessageSquare,
      website: Globe,
      other: Share2
    };
    return iconComponents[platform] || Share2;
  };

  const getPublicCardUrl = () => {
    // If we're on a public card page, use the current URL
    if (window.location.pathname.startsWith('/card/')) {
      return window.location.href;
    }
    // If we're on the dashboard or other page, construct the public URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/card/${card.id}`;
  };

  const handleShare = async (event?: React.MouseEvent) => {

  //   console.log("handleShare");
    const shareUrl = getPublicCardUrl();
    const shareText = `${card.name} - ${card.position || ''} at ${card.company || ''}`;
    const shareTitle = `${card.name} 的数字名片`;

    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent )) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        console.log('分享成功');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.log('分享被取消或失败:', error);
          // Fallback to clipboard
          await copyToClipboard(shareUrl, event);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(shareUrl, event);
    }
    
  };





  const copyToClipboard = async (text: string, event?: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
      const button = event?.currentTarget as HTMLElement;
      const originalText = button?.querySelector('span')?.textContent || button?.textContent;
      if (button) {
        const span = button.querySelector('span') || button;
        span.textContent = '已复制!';
        button.classList.add('bg-green-100', 'text-green-800');
        
        setTimeout(() => {
          span.textContent = originalText;
          button.classList.remove('bg-green-100', 'text-green-800');
        }, 2000);
      } else {
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('链接已复制到剪贴板');
      } catch (fallbackError) {
        console.error('复制失败:', fallbackError);
        alert('请手动复制链接: ' + text);
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
ORG:${card.company || ''}
TITLE:${card.position || ''}
TEL:${card.phone || ''}
TEL;TYPE=WORK:${card.officePhone || ''}
EMAIL:${card.email || ''}
URL:${card.website || ''}
ADR:;;${card.address || ''};;;;
NOTE:${card.bio || ''}
END:VCARD`;

    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        {card.coverPhoto && (
          <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${card.coverPhoto})` }} />
        )}
        
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white ${card.coverPhoto ? 'rounded-t-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {card.avatar ? (
                <img 
                  src={card.avatar} 
                  alt={card.name}
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{card.name}</h1>
                {card.position && <p className="text-blue-100">{card.position}</p>}
                {card.company && <p className="text-blue-100">{card.company}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOwner && card.viewCount !== undefined && (
                <div className="flex items-center space-x-1 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{card.viewCount}</span>
                </div>
              )}
              {isOwner && onEdit && (
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  编辑
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Contact Information */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('contact')}
            </h2>
            
            <div className="grid gap-3">
              {card.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{card.phone}</span>
                </div>
              )}
              
              {card.officePhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{card.officePhone} (办公)</span>
                </div>
              )}
              
              {card.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a 
                    href={`mailto:${card.email}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {card.email}
                  </a>
                </div>
              )}
              
              {card.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a 
                    href={card.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {card.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              
              {card.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{card.address}</span>
                </div>
              )}
              
              {card.location && (
                <div className="flex items-center space-x-3">
                  <div className="inline-block bg-red-100 border border-red-300 rounded px-2 py-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-red-600" />
                      <span className="text-sm font-medium text-red-800">{card.location}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {card.socialLinks && card.socialLinks.length > 0 && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                社交媒体
              </h2>
              <div className="flex flex-wrap gap-2">
                {card.socialLinks.map((link: any, index: number) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{link.platform}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products */}
          {card.products && card.products.length > 0 && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                产品/服务
              </h2>
              <div className="grid gap-4">
                {card.products.map((product: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    )}
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    {/* Product Photos Gallery */}
                    {product.photos && product.photos.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">产品照片</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {product.photos.map((photo: string, photoIndex: number) => (
                            <img 
                              key={photoIndex}
                              src={photo} 
                              alt={`${product.name} photo ${photoIndex + 1}`}
                              className="w-full h-24 object-cover rounded-md border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry Tags */}
          {card.industryTags && card.industryTags.length > 0 && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                行业标签
              </h2>
              <div className="flex flex-wrap gap-2">
                {card.industryTags.map((tag: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag.tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {card.bio && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                个人简介
              </h2>
              <p className="text-gray-600 leading-relaxed">{card.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={(e) => handleShare(e)} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              {t('share')}
            </Button>
            
            <Button onClick={downloadVCard} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              保存到通讯录
            </Button>
            
            <Button 
              onClick={() => setShowQRCode(!showQRCode)} 
              variant="outline"
            >
              <QrCode className="w-4 h-4 mr-2" />
              二维码
            </Button>
            
            <Button 
              onClick={() => setShowWalletIntegration(true)} 
              variant="outline"
            >
              <Wallet className="w-4 h-4 mr-2" />
              电子钱包
            </Button>
            
            {onSave && (
              <Button onClick={onSave} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                收藏名片
              </Button>
            )}
          </div>

          {/* QR Code Modal */}
          {showQRCode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">扫描二维码</h3>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <QRCodeComponent 
                      value={getPublicCardUrl()} 
                      size={192}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    扫描二维码快速保存联系方式
                  </p>
                  <p className="text-xs text-gray-500 mb-4 break-all">
                    {getPublicCardUrl()}
                  </p>
                  <div className="space-y-2">
                    <Button onClick={() => setShowQRCode(false)} className="w-full">
                      关闭
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={(e) => copyToClipboard(getPublicCardUrl(), e)}
                      className="w-full"
                    >
                      复制链接
                    </Button>
                    {window.location.pathname !== '/card/' + card.id && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          window.open(getPublicCardUrl(), '_blank');
                        }}
                        className="w-full"
                      >
                        在新窗口打开
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Integration Modal */}
          {showWalletIntegration && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">电子钱包集成</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWalletIntegration(false)}
                    >
                      关闭
                    </Button>
                  </div>
                  <WalletIntegration card={card} />
                </div>
              </div>
            </div>
          )}

          {/* Created Date */}
          {card.createdAt && (
            <div className="flex items-center justify-center pt-4 text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              创建于 {new Date(card.createdAt).toLocaleDateString('zh-CN')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BusinessCardDisplay({ 
  card, 
  isOwner = false, 
  onEdit, 
  onShare, 
  onSave 
}: BusinessCardDisplayProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showWalletIntegration, setShowWalletIntegration] = useState(false);

  const handleBookAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    // You could show a success message here
  };

  // Check if this card uses the wealth management template
  if (card.template === 'wealth-management') {
    return (
      <>
        <WealthManagementCard
          card={card}
          isOwner={isOwner}
          onEdit={onEdit}
          onShare={onShare}
          onSave={onSave}
          onBookAppointment={handleBookAppointment}
        />
        
        {/* Appointment Form Dialog */}
        <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>預約諮詢</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              cardId={card.id}
              cardName={card.name}
              cardCompany={card.company}
              onSuccess={handleAppointmentSuccess}
              onCancel={() => setShowAppointmentForm(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Check if this card uses the real estate template
  if (card.template === 'real-estate') {
    return (
      <>
        <RealEstateCard
          card={card}
          isOwner={isOwner}
          onEdit={onEdit}
          onShare={onShare}
          onSave={onSave}
          onBookAppointment={handleBookAppointment}
        />
        
        {/* Appointment Form Dialog */}
        <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>預約看房</DialogTitle>
            </DialogHeader>
            <AppointmentForm
              cardId={card.id}
              cardName={card.name}
              cardCompany={card.company}
              onSuccess={handleAppointmentSuccess}
              onCancel={() => setShowAppointmentForm(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Use default display for other templates
  return (
    <>
      <DefaultBusinessCardDisplay {...{ card, isOwner, onEdit, onShare, onSave }} />
      
      {/* Appointment Form Dialog for other templates */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>預約服務</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            cardId={card.id}
            cardName={card.name}
            cardCompany={card.company}
            onSuccess={handleAppointmentSuccess}
            onCancel={() => setShowAppointmentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Wallet Integration Modal */}
      <Dialog open={showWalletIntegration} onOpenChange={setShowWalletIntegration}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>电子钱包集成</DialogTitle>
          </DialogHeader>
          <WalletIntegration card={card} />
        </DialogContent>
      </Dialog>
    </>
  );
}