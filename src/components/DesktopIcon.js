import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export const DesktopIcon = props => {
    const {icon, linkName, title, style, noposition, textColor, iconColor, onClick, ...extraProps} = props;
    const finalStyle = noposition ? {
        ...style,
        ...styles.container,
    } : {
        ...style,
        ...styles.container,
        ...styles.overflowGuard,
    };
    const finalTextColor = textColor || '#71b1cd';
    const finalIconColor = iconColor || '#71b1cd';
    return (
        <Link to={linkName || '/not-found'} onClick={onClick}>
            <div style={finalStyle} {...extraProps}>
                <div style={{maxWidth: 50, textAlign: 'center', color: finalTextColor, pointerEvents: 'all'}}>
                    <FontAwesomeIcon 
                        style={{filter: `drop-shadow(1px 1px 1px ${finalIconColor})`}}
                        icon={icon} fontSize={30} color={finalIconColor} />
                    <br/>
                    <span>{title}</span>
                </div>
            </div>
        </Link>
    );
}

const styles = {
    overflowGuard: {
        display: 'flex', 
        height: 60, 
        width: 60, 
        marginBottom: 15,
        marginTop: 15,
        marginLeft: 5, 
        marginRight: 5, 
    },
    container: {
        justifyContent: 'center', 
        overflow: 'hidden', 
        userSelect: 'none',
        pointerEvents: 'none',
    },
};