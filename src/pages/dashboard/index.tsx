import { GetServerSideProps } from "next";
import styles from "./styles.module.css";
import Head from "next/head";

import { getSession } from "next-auth/react";

import { Textarea } from "@/components/textarea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";

import { db } from "@/services/firebaseConnection";
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";

import Link from "next/link";

interface HomeProps{
    user: {
        email: string;
    }
}

interface TaskProps{
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard( {user}: HomeProps){
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTarefas(){
            const tarefasRef = collection(db, "tarefas");
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email), //Quando usamos o where, precisamos criar o indice no firebase
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TaskProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    })
                })

                setTasks(lista);
            })
        }

        loadTarefas();
    },[user?.email])

    function handleChangePublic(event: ChangeEvent <HTMLInputElement>){
        setPublicTask(event.target.checked);
    }

    async function handleRegisterTask(event: FormEvent){
        event.preventDefault();

        if(input === "") return;

        try{
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            });

            setInput("");
            setPublicTask(false);
        }catch(err){
            console.log(err);
        }
    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        ) //navigator.clipboard.writeText serve para copiarmos um texto

        alert("URL copiada com sucesso!");
    }

    async function handleDeleteTask(id: string){
        const docRef = doc(db, "tarefas", id);

        await deleteDoc(docRef)
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>What is your task?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                placeholder="Enter your task..."
                                value={input}
                                onChange={ (event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value) }
                            />

                            <div className={styles.checkboxArea}>
                                <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic} 
                                />
                                <label>Leave a public task</label>
                            </div>

                            <button type="submit" className={styles.button}>Register</button>
                        </form>
                    </div>
                </section>

                <section className={styles.textContainer}>
                    <h1>My tasks</h1>

                    {tasks.map((item) => (
                        <article className={styles.task} key={item.id}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PUBLIC</label>
                                    <button className={styles.shareButton} onClick={ () => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff"/>
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ): (
                                    <p>{item.tarefa}</p>
                                )}
                                <button className={styles.trashButton} onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140"/>
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ( { req } ) => {
    const session = await getSession( { req } );

    if(!session?.user){
        // Se nao tem usuario, vamos redirecionar para a home
        return{
            redirect:{
                destination: "/",
                permanent: false, //Aqui passei permanent false porque nao quero que seja permanente, quero que seja apenas enquanto o usuario nao estiver logado.
            }
        }
    }
    
    return{
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    }
}; {/* isso aqui é o que acontece do lado do servidor, ou seja, do cliente */}