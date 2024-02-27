import styles from "./table.module.css";

const Table = ({array}) => {
    return (
        <div className={styles.table_container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.header}>ID</th>
                        <th className={styles.header}>Operacion</th>
                        <th className={styles.header}>TME</th>
                        <th className={styles.header}>ETA</th>
                        <th className={styles.header}>Resultado</th>
                    </tr>
                </thead>
                <tbody className={styles.body}>
                    {array.map(proceso => (
                        <tr key={proceso.id}>
                            <td>{proceso.id}</td>
                            <td>{proceso.operacion}</td>
                            <td>{proceso.tme}</td>
                            <td>{proceso.eta}</td>
                            <td>{proceso.operacion_resuelta}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
    );
}

export default Table;