import { Map, Language, FolderOutlined, SettingsOutlined, AutoAwesomeMosaicOutlined, ChevronLeft, ChevronRight, ShieldOutlined } from '@mui/icons-material';

// Accepts activeItem (string or number) and onSelect (function) as props
function DashboardSidebar({ activeItem, onSelect, is_superuser, isOpen, onToggle }) {
  const menuItems = [
    {
      id: 0,
      label: 'Overview',
      icon: AutoAwesomeMosaicOutlined
    },
    {
      id: 1,
      label: 'Settings',
      icon: SettingsOutlined
    },
    {
      id: 2,
      label: 'Sources',
      icon: Language
    },
    {
      id: 3,
      label: 'Files',
      icon: FolderOutlined
    },
    {
      id: 5,
      label: 'MindMap',
      icon: Map
    },
    {
      id: 6,
      label: 'INWI Security',
      icon: ShieldOutlined
    }
  ];

  const handleItemClick = (itemId) => {
    if (onSelect) onSelect(itemId);
  };

  return (
    // The parent div is relative to position the absolute button inside it
    <div className={`relative bg-bg-background border-r border-border transition-all  ${!isOpen ? 'w-16' : 'w-48'} h-full flex flex-col`}>
      {/* Navigation Items - takes up remaining space */}
      <div className="flex-grow py-4">
        {menuItems.map((item) => {
          if (!is_superuser && item.label === "Files") return null; // Return null for cleaner rendering
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${isActive
                  ? 'bg-highlight text-brand border-r-4 border-brand-light' // Made border thicker
                  : 'text-text-primary hover:bg-hover'
                }`}
            >
              <IconComponent className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse/Expand Button - positioned at the bottom */}
      <div className="p-1 border-t border-border">
        <button
          onClick={onToggle} // Directly use onToggle
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-primary hover:bg-hover transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default DashboardSidebar;