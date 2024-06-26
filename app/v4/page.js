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
import Table from "../components/table/Table";

function generateRandomExpression() {
  const operators = ['+', '-', '*', '/', '%'];
  const randomNumber = () => Math.floor(Math.random() * 10) + 1; // Generate a random number between 1 and 10
  const randomOperator = () => operators[Math.floor(Math.random() * operators.length)]; // Pick a random operator

  // Generate a random expression with two numbers and one operator
  return `${randomNumber()} ${randomOperator()} ${randomNumber()}`;
}

function generateRandomNumber() {
  return Math.floor(Math.random() * (18 - 5 + 1)) + 5; // Generates a random integer between 1 and 20
}

let global_counter = 0;

class Proceso {
  constructor(op, eta, id) {
    this.operacion = op;
    this.tme = eta; // Guardar el tme inicial
    this.eta = eta;
    this.id = id
    this.operacion_resuelta = evaluate(op)
    this.tiempo_bloqueado = 0;

    // TIEMPOS
    this.haSidoBloqueado = false;
    this.tiempo_llegada = null
    this.tiempo_finalizacion = null
    this.tiempo_retorno = null
    this.tiempo_respuesta = null
    this.tiempo_espera = null
    this.tiempo_servicio = null
  }
}

// Tiempos
// - [X] Llegada
// - [X] Finalizacion
// - [X] Respuesta
// - [X] Retorno
// - [ ] Espera
// - [ ] Servicio

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
  const [finished, setFinished] = useState(false);
  // --------------------
  const [memory, setMemory] = useState([])
  const [keyPressed, setKeyPressed] = useState()
  const [blocked, setBlocked] = useState([]);
  const [tableArray, setTableArray] = useState([]);
  const [arrayCopy, setArrayCopy] = useState([]);
  const [quantum, setQuantum] = useState(0);
  const [quantumCounter, setQuantumCounter] = useState(0);
  const [triggerRoundRobin, setTriggerRoundRobin] = useState(false);

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
    if (memory.length == 0 && blocked.length > 0) {
      setCountdown(10 - blocked[0].tiempo_bloqueado);
    } else if (memory.length > 0) {
      // lotes == procesos
      let current_process = memory[0]
      setCountdown(current_process.eta)

      let new_memory = memory.slice(1);

      if (lotes.length > 0) {
        //let toBeAdded_process = lotes[0];
        if (memory.length < 4 && blocked.length == 0) {
          // No hay bloqueados, espacio para mas procesos
          let quantity = 4 - memory.length;
          let toBeAddedProcesses = lotes.slice(0, quantity);
          for (let process of toBeAddedProcesses) process.tiempo_llegada = globalCounter;
          setLotes(lotes.slice(quantity));
          new_memory = new_memory.concat(toBeAddedProcesses);
        }
        // memory.length == 1 && blocked.length == 2 || memory.length == 2 && blocked.length == 1
      }

      setMemory(new_memory);




        // Seteo tiempo de respuesta
        if (current_process.tiempo_respuesta == null) current_process.tiempo_respuesta = globalCounter - current_process.tiempo_llegada;
        setCurrent(current_process);

        setProcessing(current_process);
      

    }
    else {
      if (started) setFinished(true);
      setStarted(false)
    }
  }, [trigger]);

  const addOneProcess= () => {
    let toBeAddedProcess = lotes[0];
    toBeAddedProcess.tiempo_llegada = globalCounter;
    let oldLotes = lotes;
    oldLotes.shift();
    setLotes(oldLotes);
    let new_memory = memory;
    new_memory.push(toBeAddedProcess);

    setMemory(new_memory);
  }

  const interrumpir_procesos = () => {
    setInterrupted(true)
    setStarted(false)

    // Set current remaining time
    // ("El valor de current es:" + current);
    let local_current = current;
    local_current.eta = countdown;
    local_current.haSidoBloqueado = true;

    //setProcessing([...processing, current])
    //setMemory([...memory, current])
    setBlocked([...blocked, current]);
    setCurrent(null)

    setStarted(true)
  }

  const setToMemory = () => {
    // Paso #1 Lograr colocarlos en "ejecucion"
    let new_memory = lotes.slice(0, 3);

    for (let i = 0; i < new_memory.length; i++) {
      new_memory[i].tiempo_llegada = 0;
    }

    setMemory(new_memory);
    setLotes(lotes.slice(3))
  }


  // Cierra modal, crea lotes y los agrega
  const cerrar_modal_y_agregar = () => {
    setModalOpen(false)

    let l = []

    for (let i = 0; i < nProcess; i++) {
      l.push(new Proceso(generateRandomExpression(), generateRandomNumber(), global_counter))
      global_counter++;
    }

    setLotes(l)
  }

  const agregar_proceso_random = () => {
    const p = new Proceso(generateRandomExpression(), generateRandomNumber(), global_counter);
    global_counter++;

    setLotes([...lotes, p]);
  }

  const handleKeyDown = (event) => {
    setKeyPressed(event.key)

    if (event.key == 'w' || event.key == 'W') {
      terminateWithError()
    } else if (event.key == 'e' || event.key == 'E') {
      interrumpir_procesos()
    } else if (event.key == 'p' || event.key == 'P') {
      pausar()
    } else if (event.key == 'c' || event.key == 'C') {
      continuar()
    } else if (event.key == 'n' || event.key == 'N') {
      agregar_proceso_random();
    } else if (event.key == 'b' || event.key == 'B') {
      if (finished) {
        console.log("IF FINISHED");
        setTableArray(arrayCopy);
        setFinished(false);
        continuar();
      } else {
        console.log("ELSE");
        let copy = [];
        if (current){
          copy[0] = current;
        }
        copy = copy.concat(processed);
        //console.log(processed)
        copy = copy.concat(memory);
        copy = copy.concat(blocked);
        
        
        console.log(copy);
        if (tableArray.length == 0){
          console.log("IF TABLE LENGTH 0");
          setTableArray(copy);
        }
        else{
          console.log("ELSE IF TABLE LENGTH 0");
          let tmp = tableArray
          tableArray.concat(copy)
          setTableArray(tmp); 

          console.log(tableArray);
        }
        setArrayCopy(tableArray)
        pausar();
        setFinished(true);
      }
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

  const handleEntradaQuantum = (value) => {
    setQuantum(value);
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
      if (tableArray.length == 0){
        setTableArray([current]);
      } else {
        setTableArray([...tableArray, current]);
      }
      
    }
  }, [trigger2]);


  useEffect(() => {
    if (prevCurrent != null && !interrupted) {
      // Proceso terminado
      prevCurrent.tiempo_finalizacion = globalCounter; // Seteo tiempo de finalizacion

      // Seteo tiempo de retorno
      prevCurrent.tiempo_retorno = prevCurrent.tiempo_finalizacion - prevCurrent.tiempo_llegada;

      // Seteo de tiempo de servicio
      if (prevCurrent.haSidoBloqueado) prevCurrent.tiempo_servicio = prevCurrent.tme;
      else prevCurrent.tiempo_servicio = prevCurrent.tme;

      // Seteo de tiempo de espera
      prevCurrent.tiempo_espera = prevCurrent.tiempo_retorno - prevCurrent.tiempo_servicio;

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
    setStarted(false);
    if(current){
      let localCurrent = current;
      if (localCurrent.eta > quantum){
        setMemory([...memory, current]);
        localCurrent.eta = countdown - 1;
        setInterrupted(true);
        setCurrent(null);
      }
    }
    setStarted(true);
  }, [triggerRoundRobin]);


  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        auxCounter++;
        setGlobalCounter(auxCounter);
        setQuantumCounter(quantumCounter + 1);
        if (quantumCounter == (quantum - 1) && memory.length != 0){
          // Si el quantum se cumple y no estamos en el ultimo proceso, ejecutar round robin
          setTriggerRoundRobin(!triggerRoundRobin);
          setQuantumCounter(0);
        }

        else if (countdown > 1) {
          if ((memory.length + blocked.length) < 3 && lotes.length > 0) {
            addOneProcess();
          }
          setCountdown(countdown - 1); // Decrease the countdown by 1

          // Aumentar un segundo a todos los proceso dentro de bloqueados
          setBlocked(blocked.map(proceso => {
            const p = { ...proceso };
            p.tiempo_bloqueado++;
            return p;
          }));

          // y a todos los proceso dentro de bloqueados es igual a 8 entonces metelo dentro de memoria
          if (blocked.length > 0){
            if (blocked[0].tiempo_bloqueado >= 8) {
              let newBlocked = blocked;
              const toReturn = newBlocked.shift();
              setBlocked(newBlocked);
  
              toReturn.tiempo_bloqueado = 0;
              setMemory([...memory, toReturn]);
            }
          }
          

        }
        if (countdown <= 1) {
          setTrigger(!trigger);
          setCurrent(null);
          setQuantumCounter(0);
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
            <h1>Ingresa el valor del quantum</h1>
            <Entrada onInputChange={handleEntradaQuantum}/>
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
            {lotes ? lotes.map((pro) => (
              <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion}</p>
            )) : null}
          </Lote>

        </Columna>

        <div className={styles.processing_zone_container}>
          <h2>{started ? "Procesando" : "Modo espera"}</h2>
          <p className={styles.counter}>Contador global: {globalCounter}</p>
          <p className={styles.counter}>Quantum: {quantum}</p>
          {finished ?
            <div className="table_zone">
              
              <Table array={tableArray} />
            </div>
            :
            <>
              <p className={styles.countdown}>Faltan {countdown} segundos</p>
              {current ?
                <p className={styles.procesoActual}>({current.id}) OP: {current.operacion} ETA: {current.eta}s TME: {current.tme}s</p>
                : null
              }
              <div className={styles.processing_zone}>
                {memory ? memory.map((pro) => (
                  <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion} ETA: {pro.eta}s TME: {pro.tme}s</p>
                )) : null}
              </div>

              <h3 className={styles.title}>Bloqueados</h3>
              <div className={styles.processing_zone}>
                {blocked ? blocked.map((pro) => (
                  <p key={pro.id} className={styles.proceso}>({pro.id}) Operación: {pro.operacion} TB: {pro.tiempo_bloqueado}</p>
                )) : null}
              </div>
            </>
          }
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