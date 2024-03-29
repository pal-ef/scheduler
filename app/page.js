'use client'

// TODO
// Validate string
// Validate seconds
// Add processes to lots

import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

import { evaluate } from "mathjs"

function customCeil(number) {
  let decimalPart = number - Math.floor(number);
  if (decimalPart === 0.25) {
      return Math.ceil(number);
  }
  return Math.ceil(number - 0.001); // Adjusting to prevent rounding up when decimal part is .25
}


class Lot {
  content = []
  isFull = false

  add(process) {
    if (this.content.length > 3) {
      this.isFull = true
      return false;
    } else {
      this.content.push(process)
    }
  }
}

class Process {
  constructor(name, operation, eta, id) {
    this.name = name;
    this.operation = operation;
    this.eta = eta;
    this.id = id
    this.solved = evaluate(operation)
  }
}

var initialCountdown;
var idCount = 0;

const Bar = ({ openModal, startProcess }) => {

  const handleOpenModal = () => {
    openModal();
  }

  const handleStartProcess = () => {
    startProcess();
  }

  return (
    <div className={styles.bar}>
      <p className={styles.button} onClick={handleOpenModal}>Agregar Proceso</p>
      <p className={styles.button} onClick={handleStartProcess}>Empezar</p>
    </div>
  )
}



export default function Home() {
  const [currentProcess, setCurrentProcess] = useState()
  const [finished, setFinished] = useState([])
  const [lot, setLot] = useState([])
  const [lots = setLots] = useState([])
  const [hasStarted, setHasStarted] = useState(false)
  const [globalCounter, setGlobalCounter] = useState(4)

  const [countdown, setCountdown] = useState(initialCountdown)
  const [isRunning, setIsRunning] = useState(false)

  const [isModalOpenned, setIsModalOpenned] = useState(false)

  const [start, setStart] = useState(false)

  useEffect(() => {
    let countdownInterval;

    if (isRunning) {
      setGlobalCounter(globalCounter - 1);
      if (globalCounter < 0) {
        setGlobalCounter(4)
      }
      countdownInterval = setInterval(() => {
        setCountdown(prevCountdown => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            // Reset countdown to initial value when it reaches zero
            clearInterval(countdownInterval);
            setIsRunning(false);
            setFinished([...finished, currentProcess])
            setCurrentProcess(null)
            return 0;
          }
        });
      }, 1000);
    } else {
      if (hasStarted) {
        // we check if other process needs to be processed
        if (lot.length > 0) {
          var cupo = lot[0]
          setCurrentProcess(cupo);
          setLot(lot.slice(1))

          setIsRunning(true);
          setCountdown(cupo.eta);
        }
      }
    }

    return () => clearInterval(countdownInterval);
  }, [isRunning, initialCountdown, start, hasStarted]);

  const openModal = () => {
    setIsModalOpenned(true)
  };

  const closeModal = () => {
    setIsModalOpenned(false)
  }

  const startProcess = () => {
    setHasStarted(true);
  }

  const [inputValue, setInputValue] = useState("");
  const [validInputValue, setValidInputValue] = useState(false)

  const [operationVal, setOperationVal] = useState("");
  const [validOperationVal, setValidOperationVal] = useState(false);

  const [etaVal, setEtaVal] = useState(1);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setValidInputValue(inputValue.length >= 2)
  };

  const handleOperationValChange = (event) => {
    setOperationVal(event.target.value);
    try {
      const evaluatedResult = evaluate(event.target.value);
      console.log(evaluatedResult)
      setValidOperationVal(true)
    } catch (error) {
      setValidOperationVal(false)
    }
  };

  const handleEtaValChange = (event) => {
    setEtaVal(event.target.value);
  };
  

  // Event handler for form submission
  const handleSubmit = (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    if (validInputValue && validOperationVal && etaVal > 0 && Number.isFinite(eval(operationVal))) {
      const n_pro = new Process(inputValue, operationVal, etaVal, idCount);
      idCount++;
      
      if (lot.length > 0) {
        setLot([...lot, n_pro])
      } else {
        setLot([n_pro])
      }

      setInputValue("");
      setOperationVal("");
      setEtaVal(5);

      closeModal();

      

      setStart(!start);
    }
  };

  return (
    <>
      {isModalOpenned ?
        <div className={styles.modal}>
          <div className={styles.form}>
            <h1 className={styles.addProcessTitle}>Add a process</h1>
            <form onSubmit={handleSubmit}>
              <h3 className={styles.formLabel}>Nombre del programador</h3>
              <input
                className={validInputValue ? styles.formInput : styles.formInputInvalid}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
              />
              <h3 className={styles.formLabel}>Operacion</h3>
              <input
                className={validOperationVal ? styles.formInput : styles.formInputInvalid}
                type="text"
                value={operationVal}
                onChange={handleOperationValChange}
              />
              <h3 className={styles.formLabel}>Tiempo Maximo Estimado</h3>
              <input
                className={styles.formInput}
                type="number"
                value={etaVal}
                onChange={handleEtaValChange}
                min={1}
                max={60}
              />
            </form>
            <p className={styles.submitButton} onClick={handleSubmit}>Crear nuevo proceso</p>
            <p className={styles.closeButton} onClick={closeModal}>Cancelar</p>
          </div>
        </div> : null}
      <Bar openModal={openModal} startProcess={startProcess} />
      <main className={styles.main}>
        <div className={styles.column}>
          <h1>{customCeil(lot.length / 4)} pendientes</h1>
          <div className={styles.box}>
            {lot.slice(0, globalCounter).map((process) => (
              <p key={process.id} className={styles.item}>
                Proceso ID {process.id}
              </p>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          {currentProcess ?
            <div className={styles.processContainer}>

              <h2 className={styles.processTimer}>{countdown}</h2>
              <h3>{currentProcess ? "Proceso en ejecución..." : ""}</h3>
              <div className={styles.process}>
                <p className={styles.processID}>Proceso ID {currentProcess ? currentProcess.id : ""}</p>

                <div className={styles.processTable}>
                  <div className={styles.processColumn}>
                    <p className={styles.processRow}>
                      Nombre programador
                    </p>
                    <p className={styles.processRow}>
                      Operacion
                    </p>
                    <p className={styles.processRow}>
                      Tiempo Maximo Estimado
                    </p>
                  </div>
                  <div className={styles.processColumn}>
                    <p className={styles.processRow}>
                      {currentProcess ? currentProcess.name : ""}
                    </p>
                    <p className={styles.processRow}>
                      {currentProcess ? currentProcess.operation : ""}
                    </p>
                    <p className={styles.processRow}>
                      {currentProcess ? currentProcess.eta : ""} segundos
                    </p>
                  </div>
                </div>
              </div>

            </div>
            : <h1 className={styles.processContainer}>Sin procesos en ejecución</h1>}
        </div>

        <div className={styles.column}>
          <h1>Completed</h1>
          <div className={styles.box}>
            {finished.map((process) => (
              <p key={process.id} className={styles.item}>
                ID: {process.id}
                <br />
                Programador: {process.name}
                <br />
                Resultado: {process.solved == "Infinity" ? "Invalido" : process.solved}
              </p>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
