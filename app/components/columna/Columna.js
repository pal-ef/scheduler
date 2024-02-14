import styles from "./column.module.css";

const Columna = ({ title, children }) => {
    return (
        <div className={styles.columna} >
            <h2>{title}</h2>
            <div className={styles.contenedor_columna}>
                {children}
            </div>
        </div>
    )
}

export default Columna