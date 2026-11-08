import React from 'react';
export function AppLayout({ children }: {
    children: React.ReactNode;
}) { return <div className="app-shell"><header className="site-header"><a href="/" className="brand" aria-label="Everyday home"><span className="brand-mark" aria-hidden="true">e.</span>everyday<span className="brand-dot">®</span></a><span className="header-note">LESS NOISE. MORE INTENTION.</span></header><main>{children}</main><footer><span>Small steps. Meaningful days.</span><span>Your space to get things done.</span></footer></div>; }
