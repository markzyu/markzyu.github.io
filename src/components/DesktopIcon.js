import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const DesktopIcon = props => {
    const {icon, title, style, noposition, ...extraProps} = props;
    const finalStyle = noposition ? {
        ...style,
        ...styles.container,
    } : {
        ...style,
        ...styles.container,
        ...styles.overflowGuard,
    };
    return (
        <div style={finalStyle} {...extraProps}>
            <div style={{maxWidth: 50, textAlign: 'center', color: 'red'}}>
                <FontAwesomeIcon icon={icon} fontSize={30} color='darkred' />
                <br/>
                <span>{title}</span>
            </div>
        </div>
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
    },
};