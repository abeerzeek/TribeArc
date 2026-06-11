import { Coins } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-neutral-950/60 pb-12 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Footer Brand Logo Centered */}
        <div className="mb-4">
          <img 
            src="https://static.vecteezy.com/system/resources/previews/006/247/448/non_2x/initial-letter-t-slice-style-logo-template-design-vector.jpg" 
            alt="TribeArc Logo" 
            className="h-[50px] w-[50px] rounded-xl object-cover border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)] mx-auto"
            referrerPolicy="no-referrer"
            id="footer-brand-logo"
          />
        </div>

        <div className="flex flex-col items-center space-y-1">
          <span className="font-sans font-extrabold text-white tracking-tight text-lg">TribeArc</span>
          <p className="text-xs text-neutral-500 max-w-md">
            Stablecoin trading, native to Arc. All rights reserved.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-1">
          <p className="text-xs text-neutral-400">
            Built by{' '}
            <a
              href="https://x.com/AbeerZeek"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-purple-400 hover:text-purple-300 transition-colors"
            >
              Abeer Zeek
            </a>
          </p>
          <p className="text-[10px] font-mono text-neutral-600">
            TribeArc v1.0.0 · Arc Testnet Protocol (5042002)
          </p>
        </div>

      </div>
    </footer>
  );
}
