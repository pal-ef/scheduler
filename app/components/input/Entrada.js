import styles from "./input.module.css";
import { useState } from "react"

function Entrada({ onInputChange }) {
    const [inputValue, setInputValue] = useState(25);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        onInputChange(newValue); // Call the callback function passed from the parent
    };

    return (
        <div className={styles.inputContainer}>
            <input
                id="inputField"
                type="number"
                min={1}
                max={100}
                value={inputValue}
                onChange={handleChange}
            />
        </div>
    );
}

export default Entrada