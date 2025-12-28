
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Smartphone, CheckCircle, Download, RefreshCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { ImageState, ProcessingResult } from './types';
import { processPixelArt } from './services/imageProcessor';

const TARGET_WIDTH = 1170;
const TARGET_HEIGHT = 2532;

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    processedUrl: null,
    isProcessing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ ...prev, error: "Please upload a valid image file." }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setState({
          file,
          previewUrl: event.target?.result as string,
          processedUrl: null,
          isProcessing: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startProcessing = async () => {
    if (!state.previewUrl) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // Simulate high-end restoration processing time for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await processPixelArt(state.previewUrl, TARGET_WIDTH, TARGET_HEIGHT);
      
      setState(prev => ({
        ...prev,
        processedUrl: result.imageUrl,
        isProcessing: false,
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: "Restoration failed. Ensure the image follows pixel-art specifications.",
      }));
    }
  };

  const downloadImage = () => {
    if (!state.processedUrl) return;
    const link = document.createElement('a');
    link.href = state.processedUrl;
    link.download = `bytepepe_wallpaper_${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setState({
      file: null,
      previewUrl: null,
      processedUrl: null,
      isProcessing: false,
      error: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00FF9C] rounded flex items-center justify-center text-black font-bold">
            BP
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">BYTEPEPE <span className="text-[#00FF9C]">WALLPAPER STUDIO</span></h1>
            <p className="text-xs text-zinc-500 mono uppercase tracking-widest">NFT Restoration Unit V.3</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs mono text-zinc-400">
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#00FF9C]" /> LOSSLESS PROTOCOL</span>
          <span className="flex items-center gap-2"><Smartphone size={14} className="text-[#00FF9C]" /> MOBILE OPTIMIZED</span>
        </div>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Upload and Controls */}
        <div className="space-y-8">
          <section className="glass p-8 rounded-2xl space-y-6">
            <h2 className="text-2xl font-semibold mb-2 flex items-center gap-3">
              <Upload className="text-[#00FF9C]" />
              SOURCE UPLOAD
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Upload your original pixel-art NFT. Our algorithm will sample the top-right 8x8 block for background extension while locking your character to the bottom grid.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                state.previewUrl ? 'border-[#00FF9C] bg-[#00FF9C]/5' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              
              {state.previewUrl ? (
                <div className="relative group">
                  <img src={state.previewUrl} className="w-32 h-32 object-contain pixelated shadow-2xl" alt="Source" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RefreshCcw className="text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="text-zinc-500" size={32} />
                  <span className="text-zinc-500 text-sm mono">SELECT NFT FILE</span>
                </>
              )}
            </div>

            {state.error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mono bg-red-500/10 p-3 rounded">
                <AlertCircle size={16} />
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={!state.previewUrl || state.isProcessing || !!state.processedUrl}
                onClick={startProcessing}
                className={`py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  state.isProcessing || !state.previewUrl || state.processedUrl
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#00FF9C] text-black hover:scale-[1.02] accent-glow'
                }`}
              >
                {state.isProcessing ? (
                  <RefreshCcw className="animate-spin" size={18} />
                ) : (
                  <Smartphone size={18} />
                )}
                CREATE
              </button>
              
              <button
                onClick={reset}
                className="py-4 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-800 transition-colors text-sm mono font-bold"
              >
                RESET
              </button>
            </div>
          </section>

          <section className="glass p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-zinc-500 mb-6 flex items-center gap-2 mono uppercase">
              <CheckCircle size={14} className="text-[#00FF9C]" />
              System Parameters
            </h3>
            <ul className="space-y-4 text-xs mono text-zinc-400">
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>Output Resolution</span>
                <span className="text-white">1170 × 2532 PX</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>Rendering Engine</span>
                <span className="text-white">Lossless Canvas v2</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>Interpolation</span>
                <span className="text-white">Nearest Neighbor</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>Position Lock</span>
                <span className="text-white">Vertical: Bottom</span>
              </li>
              <li className="flex justify-between">
                <span>Sampling Node</span>
                <span className="text-white">TR-8x8 Block</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Preview/Result */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-[400px] aspect-[1170/2532] bg-zinc-900 rounded-[3rem] p-4 border-[8px] border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Phone Bezel elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-zinc-800 rounded-b-3xl z-20"></div>
            
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black relative">
              {!state.processedUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 text-center px-8">
                  <Smartphone size={64} className="mb-4 opacity-20" />
                  <p className="text-sm mono">WAITING FOR RESTORATION...</p>
                </div>
              ) : (
                <img 
                  src={state.processedUrl} 
                  className="w-full h-full object-cover pixelated"
                  alt="Restored Result"
                />
              )}
            </div>
          </div>
          
          {state.processedUrl && (
            <div className="mt-8 w-full max-w-[400px]">
              <button 
                onClick={downloadImage}
                className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#00FF9C] transition-colors"
              >
                <Download size={20} />
                DOWNLOAD WALLPAPER
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-24 w-full border-t border-zinc-800 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-zinc-600 text-xs mono">© 2024 BYTEPEPE STUDIO. ALL ASSETS PRESERVED LOSSLESSLY.</p>
        <div className="flex gap-8 text-zinc-600 text-xs mono">
          <span className="hover:text-[#00FF9C] cursor-pointer">DOCUMENTATION</span>
          <span className="hover:text-[#00FF9C] cursor-pointer">API TERMINAL</span>
          <span className="hover:text-[#00FF9C] cursor-pointer">SECURITY REPORT</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
