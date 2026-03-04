import React from 'react';
import * as FiIcons from 'react-icons/fi';

interface IconRendererProps {
    name: string;
    size?: number | string;
    color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, size = 20, color }) => {
    // @ts-ignore - Dynamic key access
    const IconComponent = FiIcons[name];

    if (!IconComponent) {
        return <FiIcons.FiHelpCircle size={size} color={color} />;
    }

    return <IconComponent size={size} color={color} />;
};
