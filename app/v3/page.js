'use client'

import { count, e, evaluate, forEach } from "mathjs"
import styles from "./page.module.css";
import buttonTypes from "../components/button/boton.module.css";
import { useState, useEffect } from "react"

import Barra from "../components/Barra"
import Boton from "../components/button/Boton";
import Modal from "../components/modal/Modal";
import Entrada from "../components/input/Entrada";
import Columna from "../components/columna/Columna";
import Lote from "../components/lote/Lote";

function generateRandomExpression() {
  const operators = ['+', '-', '*', '/', '%'];
  const randomNumber = () => Math.floor(Math.random() * 10) + 1; // Generate a random number between 1 and 10
  const randomOperator = () => operators[Math.floor(Math.random() * operators.length)]; // Pick a random operator

  // Generate a random expression with two numbers and one operator
  return `${randomNumber()} ${randomOperator()} ${randomNumber()}`;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 10) + 1; // Generates a random integer between 1 and 20
}

class Proceso {
  constructor(op, eta, id) {
    this.operacion = op;
    this.tme = eta; // Guardar el tme inicial
    this.eta = eta;
    this.id = id
    this.operacion_resuelta = evaluate(op)

    // TIEMPOS
    this.tiempo_llegada = null
    this.tiempo_finalizacion = null
    this.tiempo_retorno = null
    this.tiempo_respuesta = null
    this.tiempo_espera = null
    this.tiempo_servicio = null
  }
}

class Lot {
  contenido = []
  estaLleno = false
  estaVacio = true

  agregar(proc) {
    this.contenido.push(proc)
    return true;
  }

  get obtenerContenido() {
    return this.contenido
  }
}

export default function Aplicacion() {
  // ------ STATE -------
  const [isModalOpen, setModalOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [lotes, setLotes] = useState([])
  const [nProcess, setNProcess] = useState(25);
  const [processing, setProcessing] = useState();
  const [countdown, setCountdown] = useState(0);
  const [trigger, setTrigger] = useState(false)
  const [processed, setProcessed] = useState([])
  const [pause, setPause] = useState(false)
  const [current, setCurrent] = useState()
  const [prevCurrent, setPrevCurrent] = useState(null)
  const [trigger2, setTrigger2] = useState(false)
  const [int, setInt] = useState(false)
  const [interrupted, setInterrupted] = useState(false)
  const [globalCounter, setGlobalCounter] = useState(0);
  // --------------------
  const [memory, setMemory] = useState([])
  const [keyPressed, setKeyPressed] = useState()

  let auxCounter = globalCounter;

  const agregar_procesos = () => {
    setModalOpen(true);
  }

  const empezar_procesos = () => {
    setTrigger(!trigger)
    setStarted(true)
    setPause(!pause)
  }

  const empezar_procesos2 = () => {
    // setTrigger(!trigger)
    // setStarted(true)
    // setPause(!pause)
    setToMemory() // pone 4 dentro de la memoria
    setTrigger(!trigger)
    setStarted(true)
    setPause(!pause)
  }

  useEffect(() => {
    if (memory.length > 0) {
      // lotes == procesos
      let current_process = memory[0]
      setCountdown(current_process.tme)
      
      let new_memory = memory.slice(1);
      new_memory.push(lotes[0]);

      setMemory(new_memory);

      setLotes(lotes.slice(1));
      setCurrent(current_process);
      setProcessing(current_process);
    } else {
      setStarted(false)
    }
  }, [trigger]);

  const interrumpir_procesos = () => {
    setInterrupted(true)
    setStarted(false)

    // Set current remaining time
    let local_current = current
    local_current.eta = countdown

    //setProcessing([...processing, current])
    setMemory([...memory, current])
    setCurrent(null)

    setStarted(true)
  }

  const setToMemory = () => {
    // Paso #1 Lograr colocarlos en "ejecucion"
    setMemory(lotes.slice(0,3));
    setLotes(lotes.slice(3))
  }
    

  // Cierra modal, crea lotes y los agrega
  const cerrar_modal_y_agregar = () => {
    setModalOpen(false)

    let global_counter = 0
    let l = []

    for (let i = 0; i < nProcess; i++) {
      l.push(new Proceso(generateRandomExpression(), generateRandomNumber(), global_counter))
      global_counter++;
    }
    setLotes(l)
  }

  const handleKeyDown = (event) => {
    setKeyPressed(event.key)

    if (event.key == 'w') {
      terminateWithError()
    } else if (event.key == 'e') {
      interrumpir_procesos()
    } else if (event.key == 'p') {
      pausar()
    } else if (event.key == 'c') {
      continuar()
    }
  };

  const terminateWithError = () => {
    let mod = current
    mod.operacion_resuelta = "ERROR"
    setCurrent(mod)
    setCountdown(0)
  }

  const cerrar_modal = () => {
    setModalOpen(false)
  }

  const interrumpir = () => {
    if (!int) {
      setInt(true);
      setStarted(false)
      let localized = current
      current.eta = countdown

      setProcessing([...processing, localized])
      setProcessed(processed.slice(0, processed.length - 1))
      setCurrent(processing[0])
    }
  }

  const handleEntradaInputChange = (value) => {
    setNProcess(value);
  };

  const pausar = () => {
    setStarted(false)
  }

  const continuar = () => {
    if (int) {
      setInt(false)
      //setTrigger2(!trigger2);
      setCurrent(processing[0])
      setProcessing(processing.slice(1))
      setCountdown(processing[0].eta)

      setStarted(true)
      setPause(!pause)
    } else {
      setStarted(true)
      setPause(!pause)
    }
  }

  useEffect(() => {
    if (current) {
      setProcessed([...processed, current])
    }
  }, [trigger2]);


  useEffect(() => {
    if (prevCurrent != null && !interrupted) {
      setProcessed([...processed, prevCurrent])
    }
    if (interrupted) {
      setPrevCurrent(null)
      setInterrupted(false)
      setCountdown(0)
    } else {
      setPrevCurrent(current)
    }

  }, [current]);




  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        auxCounter++;
        setGlobalCounter(auxCounter);
        if (countdown > 1) {
          setCountdown(countdown - 1); // Decrease the countdown by 1
        }
        else {
          setTrigger(!trigger);
          setCurrent(null);
        }
      }, 1000); // Delay of 1000 milliseconds (1 second) for each countdown iteration

      // Clear the timeout if the component unmounts or if the countdown reaches 0
      return () => {
        clearTimeout(timer);
      };
    }
  }, [processing, countdown, pause]); // Run the effect whenever the countdown state changes


  return (
    <div tabIndex={0} onKeyDown={handleKeyDown}>

      {
        isModalOpen ?
          <Modal>
            <h1>Ingresa el numero de procesos</h1>
            <Entrada onInputChange={handleEntradaInputChange} />
            <div className={styles.rowLike}>
              <Boton text="Confimar" type={buttonTypes.confirm} action={cerrar_modal_y_agregar} />
              <Boton text="Cancelar" type={buttonTypes.cancel} action={cerrar_modal} />
            </div>
          </Modal>
          :
          null
      }

      <Barra>
        <Boton text="Agregar" type={buttonTypes.start} action={agregar_procesos} />
        <Boton text="Empezar" type={buttonTypes.start} action={empezar_procesos2} />
        <Boton text="Interrumpir" type={buttonTypes.int} action={interrumpir} />
        <Boton text="Pausar" type={buttonTypes.int} action={pausar} />
        <Boton text="Continuar" type={buttonTypes.int} action={continuar} />
      </Barra>

      <div className={styles.contenedorColumnas}>

        {/* // TODO: Mostrar numero de procesos en vez de lotes */}
        <Columna title={lotes.length + " procesos en espera"}>
          {/* // Esto mapea los lotes y por cada lote crea un "Lote" */}
          {/* // TODO: Crear un solo "Lote" con todos los procesos */}
            <Lote id={"Procesos "}>
              {lotes.map((pro) => (
                <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion}</p>
              ))}
            </Lote>
          
        </Columna>

        <div className={styles.processing_zone_container}>
          <h2>{started ? "Procesando" : "Modo espera"}</h2>
          <p className={styles.countdown}>Contador global: {globalCounter}</p>


          <>
            {started ? <p className={styles.countdown}>Faltan {countdown} segundos</p> : null}
            {current ?
              <p className={styles.procesoActual}>({current.id}) Resultado: {current.operacion} ETA: {current.eta}s TME: {current.tme}s</p>
              : null
            }
            <div className={styles.processing_zone}>
              {memory ? memory.map((pro) => (
                <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion} ETA: {pro.eta}s TME: {pro.tme}s</p>
              )) : null}
            </div>
          </>
        </div>

        <Columna title={"Terminados"}>
          <Lote id={"TERMINADOS"}>
            {processed ? processed.map((pro, index) => (
              <div key={pro.id}>
                <p className={styles.proceso}>({pro.id}) Resultado: {pro.operacion_resuelta}</p>
              </div>
            )) : null}
          </Lote>
        </Columna>

      </div>
    </div>
  )
}