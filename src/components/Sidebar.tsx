'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  hasUnsavedChanges?: boolean;
  onNavigationAttempt?: (path: string) => boolean;
}

export default function Sidebar({ isOpen = false, onClose, hasUnsavedChanges = false, onNavigationAttempt }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const navItems = [
    { href: '/relatorio/novo', label: 'Formulário', icon: 'form' },
    { href: '/dashboard', label: 'Relatórios', icon: 'list' },
    { href: '/configuracoes', label: 'Configurações', icon: 'settings' },
    { href: '/suporte', label: 'Suporte', icon: 'support' },
  ];

  const handleNavigation = (href: string) => {
    if (hasUnsavedChanges && onNavigationAttempt) {
      const shouldNavigate = onNavigationAttempt(href);
      if (!shouldNavigate) {
        return;
      }
    }
    router.push(href);
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    showToast('Logout realizado com sucesso!', 'success');
    router.push('/login');
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'form':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'list':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        );
      case 'support':
        return (
          // Headset icon
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 11a9 9 0 1118 0" />
            <path d="M21 16.5a2.5 2.5 0 01-2.5 2.5H17a2 2 0 01-2-2v-3a2 2 0 012-2h4v4.5z" />
            <path d="M3 16.5A2.5 2.5 0 005.5 19H7a2 2 0 002-2v-3a2 2 0 00-2-2H3v4.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <Image
          src="/img/logo_OdontoReport.png"
          alt="logo"
          width={30}
          height={30}
        />
        <span className="logo-text">OdontoReport</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => handleNavigation(item.href)}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <div className="nav-icon">{getIcon(item.icon)}</div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-copyright">
        <a href="https://rodrigopires.dev.br" target="_blank" rel="noopener noreferrer">
          © {new Date().getFullYear()} Rodrigo Pires
        </a>
      </div>

      <div className="sidebar-user">
        {session?.user ? (
          <>
            <div className="user-avatar">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{session.user.name}</div>
              <div className="user-clinic">{session.user.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-logout"
              title="Sair"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="user-info">
            <div className="user-name">Carregando...</div>
          </div>
        )}
      </div>
    </aside>
  );
}
