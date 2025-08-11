import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Video, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
interface MatchMediaUploadProps {
  matchId: string;
  onMediaAdded: () => void;
}

interface MediaFile {
  file: File;
  type: 'image' | 'video';
  preview: string;
  caption: string;
}

export const MatchMediaUpload = ({ matchId, onMediaAdded }: MatchMediaUploadProps) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files || []);

    const processed: MediaFile[] = [];

    for (const original of picked) {
      const isImage = original.type.startsWith('image/');
      const isVideo = original.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: 'Tipo de arquivo não suportado',
          description: `${original.name} deve ser uma imagem ou vídeo (.jpg, .jpeg, .png, .webp, .mp4, .mov, .avi, .webm).`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        let fileToUse: File = original;

        // Compress/resize large images client-side
        if (isImage && original.size > 2 * 1024 * 1024) {
          const compressedBlob = await imageCompression(original, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.8,
          });
          fileToUse = new File([compressedBlob], original.name, { type: compressedBlob.type || original.type });
        }

        // Allow larger videos (up to ~200MB)
        if (isVideo && original.size > 200 * 1024 * 1024) {
          toast({
            title: 'Vídeo muito grande',
            description: `${original.name} excede 200MB. Tente um arquivo menor.`,
            variant: 'destructive',
          });
          continue;
        }

        const isImg = fileToUse.type.startsWith('image/');
        const type: 'image' | 'video' = isImg ? 'image' : 'video';
        const preview = URL.createObjectURL(fileToUse);

        processed.push({ file: fileToUse, type, preview, caption: '' });
      } catch (err: any) {
        console.error('Erro processando arquivo', original.name, err);
        toast({
          title: 'Erro ao processar arquivo',
          description: `${original.name} não pôde ser processado.`,
          variant: 'destructive',
        });
      }
    }

    if (processed.length) setFiles((prev) => [...prev, ...processed]);
  };
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, caption } : file
    ));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      for (const mediaFile of files) {
        // Create a unique filename
        const fileExtension = mediaFile.file.name.split('.').pop();
        const fileName = `match-${matchId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('match-media')
          .upload(fileName, mediaFile.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('match-media')
          .getPublicUrl(fileName);
        
        // Insert into match_media table
        const { error: insertError } = await supabase
          .from('match_media')
          .insert({
            match_id: matchId,
            media_type: mediaFile.type,
            media_url: publicUrl,
            caption: mediaFile.caption || null
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw insertError;
        }
      }

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso!`,
      });

      // Clean up preview URLs
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      onMediaAdded();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Erro",
        description: `Falha no upload: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Enviar Mídia</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="media-upload">Selecionar Arquivos</Label>
          <Input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Imagens e vídeos até 50MB cada
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Arquivos Selecionados</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {file.type === 'image' ? (
                    <img 
                      src={file.preview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{file.file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Legenda (opcional)"
                    value={file.caption}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            
            <Button 
              onClick={uploadFiles} 
              disabled={uploading} 
              className="w-full"
            >
              {uploading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Enviar {files.length} arquivo(s)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};