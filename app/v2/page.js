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
  const operators = ['+', '-', '*', '/'];
  const randomNumber = () => Math.floor(Math.random() * 10) + 1; // Generate a random number between 1 and 10
  const randomOperator = () => operators[Math.floor(Math.random() * operators.length)]; // Pick a random operator

  // Generate a random expression with two numbers and one operator
  return `${randomNumber()} ${randomOperator()} ${randomNumber()}`;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * 15) + 1; // Generates a random integer between 1 and 20
}

class Proceso {
  constructor(op, eta, id) {
    this.operacion = op;
    this.tme = eta;
    this.id = id
    this.operacion_resuelta = evaluate(op)
  }
}

class Lot {
  contenido = []
  estaLleno = false
  estaVacio = true

  agregar(proc) {
    this.estaVacio = false
    if (this.contenido.length > 3) {
      this.estaLleno = true
      return false;
    }
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
  const [nProcess, setNProcess] = useState(5);
  const [processing, setProcessing] = useState();
  const [countdown, setCountdown] = useState(0);
  const [trigger, setTrigger] = useState(false)
  const [processed, setProcessed] = useState([])
  const [pause, setPause] = useState(false)
  const [current, setCurrent] = useState()
  const [trigger2, setTrigger2] = useState(false)
  const [int, setInt] = useState(false)
  // --------------------
  const [keyPressed, setKeyPressed] = useState('');

  const agregar_procesos = () => {
    setModalOpen(true);
  }

  const empezar_procesos = () => {
    setTrigger(!trigger)
    setStarted(true)
    setPause(!pause)
  }

  const interrumpir_procesos = () => {
    console.log("Interrumpiendo proceso actual.")
  }

  const cerrar_modal_y_agregar = () => {
    setModalOpen(false)

    let lotes_local = []

    let numero_procesos = nProcess

    let numero_lotes = Math.floor(numero_procesos / 4)
    let restantes = numero_procesos % 4

    let global_counter = 0

    for (let i = 0; i < numero_lotes; i++) {
      let l = new Lot()
      for (let j = 0; j < 4; j++) {
        global_counter++;
        l.agregar(new Proceso(generateRandomExpression(), generateRandomNumber(), global_counter))
      }
      lotes_local.push(l);
    }

    if (restantes) {
      let l = new Lot()
      for (let j = 0; j < restantes; j++) {
        global_counter++;
        l.agregar(new Proceso(generateRandomExpression(), generateRandomNumber(), global_counter))
      }
      lotes_local.push(l);
    }
    setLotes(lotes_local)
  }

  const handleKeyDown = (event) => {
    setKeyPressed(event.key)

    if (event.key == 'e') {
      interrumpir()
    } else if (event.key == 'w') {
      terminateWithError()
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
      current.tme = countdown

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
      setTrigger2(!trigger2);
      setCurrent(processing[0])
      setProcessing(processing.slice(1))
      setCountdown(processing[0].tme)

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
    if (lotes.length > 0) {
      let working_lot = lotes[0]
      setLotes(lotes.slice(1))
      setProcessing(working_lot.contenido);
    } else {
      setStarted(false)
    }

  }, [trigger]);

  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown(countdown - 1); // Decrease the countdown by 1
        }
        else {
          if (processing.length > 0) {
            setTrigger2(!trigger2);
            setCurrent(processing[0])
            setProcessing(processing.slice(1))
            setCountdown(processing[0].tme)
          } else {
            setTrigger(!trigger)
          }
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
        <Boton text="Empezar" type={buttonTypes.start} action={empezar_procesos} />
        <Boton text="Interrumpir" type={buttonTypes.int} action={interrumpir} />
        <Boton text="Pausar" type={buttonTypes.int} action={pausar} />
        <Boton text="Continuar" type={buttonTypes.int} action={continuar} />
      </Barra>

      <div className={styles.contenedorColumnas}>

        <Columna title={lotes.length + " lotes pendientes"}>
          {lotes ? lotes.map((lote, index) => (
            <Lote key={index} id={"LOTE " + index}>
              {lote.contenido.map((pro) => (
                <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion}</p>
              ))}
            </Lote>
          )) : null}
        </Columna>

        <div className={styles.processing_zone_container}>
          <h2>{started ? "Procesando" : "Procesamiento en espera"}</h2>


          <>
            <p className={styles.countdown}>{countdown}</p>

            <div className={styles.processing_zone}>
              {processing ? processing.map((pro) => (
                <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion} ETA: {pro.tme}s</p>
              )) : null}
            </div>
          </>
        </div>

        <Columna title={"Terminados"}>
          <Lote id={"TERMINADOS"}>
            {processed ? processed.map(pro => (
              <p key={pro.id} className={styles.proceso}>({pro.id}) Resultado: {pro.operacion_resuelta}</p>
            )) : null}
          </Lote>
        </Columna>

      </div>
    </div>
  )
}