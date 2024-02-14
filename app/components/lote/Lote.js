import styles from "./lote.module.css";

const Lote = ({children, id}) => {

  return (
    <div className={styles.lote} >
        <h3 className={styles.label}>{id}</h3>
        {children}
    </div>
  )
}

export default Lote