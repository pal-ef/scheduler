import styles from "./table.module.css";

const Table = ({array}) => {
    return (
        <div className={styles.table_container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.header}>ID</th>
                        <th className={styles.header}>Operacion</th>
                        {/* <th className={styles.header}>TME</th> */}
                        <th className={styles.header}>TME</th>
                        <th className={styles.header}>TL</th>
                        <th className={styles.header}>TF</th>
                        <th className={styles.header}>TRES</th>
                        <th className={styles.header}>TRET</th>
                        <th className={styles.header}>TE</th>
                        <th className={styles.header}>TS</th>
                        <th className={styles.header}>Resultado</th>
                    </tr>
                </thead>
                <tbody className={styles.body}>
                    {array.map(proceso => (
                        <tr key={proceso.id}>
                            <td>{proceso.id}</td>
                            <td>{proceso.operacion}</td>
                            <td>{proceso.tme}</td>
                            {/* <td>{proceso.eta}</td> */}
                            <td>{proceso.tiempo_llegada}</td>
                            <td>{proceso.tiempo_finalizacion}</td>
                            <td>{proceso.tiempo_respuesta}</td>
                            <td>{proceso.tiempo_retorno}</td>
                            <td>{proceso.tiempo_espera}</td>
                            <td>{proceso.tiempo_servicio}</td>
                            <td>{proceso.operacion_resuelta}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;