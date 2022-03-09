import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const DesktopIcon = props => {
    const {icon, title, ...extraProps} = props;
    return (
        <div style={styles.overflowGuard} {...extraProps}>
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
        justifyContent: 'center', 
        overflow: 'hidden', 
        userSelect: 'none',
    }
};