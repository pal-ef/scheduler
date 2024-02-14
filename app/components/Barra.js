import styles from "./bar.module.css";

const Barra = ({children}) => {
  return (
    <div className={styles.barra}>
        {children}
    </div>
  )
}

export default Barra