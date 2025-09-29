import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { RankingEntry, RankingType, RankingPeriod } from '@/hooks/fut-details/types';

interface RankingShareProps {
  rankings: RankingEntry[];
  type: RankingType;
  period: RankingPeriod;
  futName: string;
  onClose: () => void;
}

export default function RankingShare({ rankings, type, period, futName, onClose }: RankingShareProps) {
  const [copied, setCopied] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  const getTypeLabel = (type: RankingType) => {
    switch (type) {
      case 'pontuacao': return 'Pontuação';
      case 'artilharia': return 'Artilharia';
      case 'assistencias': return 'Assistências';
      case 'vitorias': return 'Vitórias';
      default: return 'Pontuação';
    }
  };

  const getPeriodLabel = (period: RankingPeriod) => {
    return period === 'anual' ? 'Anual' : 'Rodada';
  };

  const getScoreLabel = (type: RankingType) => {
    switch (type) {
      case 'pontuacao': return 'pts';
      case 'artilharia': return 'gols';
      case 'assistencias': return 'assist';
      case 'vitorias': return 'vitórias';
      default: return 'pts';
    }
  };

  const generateShareText = () => {
    const typeLabel = getTypeLabel(type);
    const periodLabel = getPeriodLabel(period);
    
    let shareText = `Ranking ${periodLabel} - ${typeLabel}\n\n`;
    
    rankings.slice(0, 10).forEach((player, index) => {
      const position = index + 1;
      const score = type === 'pontuacao' ? player.score :
                   type === 'artilharia' ? player.goals :
                   type === 'assistencias' ? player.assists :
                   player.wins || 0;
      
      shareText += `${position}º ${player.name} - ${score} ${getScoreLabel(type)}\n`;
    });
    
    return shareText;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWhatsApp = () => {
    const shareText = generateShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    
    try {
      window.open(whatsappUrl, '_blank');
      setWhatsappOpened(true);
      setTimeout(() => setWhatsappOpened(false), 3000);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback to copy if WhatsApp fails
      handleCopy();
    }
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try native share first
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Ranking ${getPeriodLabel(period)} - ${getTypeLabel(type)}`,
            text: shareText,
          });
          return;
        } catch (error) {
          console.error('Error sharing:', error);
          // If native share fails, try WhatsApp
          handleWhatsApp();
          return;
        }
      }
      
      // If no native share, try WhatsApp directly
      handleWhatsApp();
      return;
    }
    
    // Desktop fallback to copy
    handleCopy();
  };

  // Check if device supports WhatsApp
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-lighter rounded-lg p-4 w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Share2 size={18} className="text-secondary" />
            <h3 className="text-white text-base font-semibold">Compartilhar Ranking</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h4 className="text-white font-medium mb-2">
            Ranking {getPeriodLabel(period)} - {getTypeLabel(type)}
          </h4>
          <div className="bg-primary rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-white text-sm whitespace-pre-wrap font-mono">
              {generateShareText()}
            </pre>
          </div>
        </div>

        <div className="space-y-2">
          {/* WhatsApp Button - Only on mobile devices */}
          {isMobile && (
            <button
              onClick={handleWhatsApp}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                whatsappOpened
                  ? 'bg-green-700 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <MessageCircle size={16} />
              <span>{whatsappOpened ? 'WhatsApp Aberto!' : 'Compartilhar no WhatsApp'}</span>
            </button>
          )}
          
          {/* Other sharing options */}
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar</span>
                </>
              )}
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-secondary text-primary rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Share2 size={14} />
                <span>Outros</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
