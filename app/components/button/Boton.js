import styles from "./boton.module.css";

const Boton = (props) => {
  const handleClick = () => {props.action()};

  return (
    <div onClick={handleClick} className={[styles.boton, props.type].join(' ')} >
        <p>{props.text}</p>
    </div>
  )
}

export default Boton