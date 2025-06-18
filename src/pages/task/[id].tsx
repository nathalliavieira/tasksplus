//Quando criamos uma arquivo com o nome como esse, significa que vamos passar algum parametro.

import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "@/services/firebaseConnection";
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";

import { Textarea } from "@/components/textarea";

import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

import { FaTrash } from "react-icons/fa";

interface TaskProps{
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        taskId: string;
    };
    allComments: CommentProps[]
}

interface CommentProps{
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({item, allComments} : TaskProps){
    const {data: session} = useSession();

    const [input, setInput] = useState("");

    const [comments, setComments] = useState<CommentProps[]>(allComments || []);

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            })

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            }

            setComments((oldItems) => [...oldItems, data]);
            setInput("");
        }catch(err){
            console.log(err);
        }
    }

    async function handleDeletComment(id: string){
        try{
            const docRef = doc(db, "comments", id);

            await deleteDoc(docRef);

            const deletComment = comments.filter((comment) => comment.id !== id);

            setComments(deletComment);

            alert("Comment successfully deleted!");
        }catch(err){
            console.log(err);
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Task details</title>
            </Head>

            <main className={styles.main}>
                <h1>Task</h1>
                <article className={styles.task}>
                    <p>{item?.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Leave a comment</h2>

                <form onSubmit={handleComment}>
                    <Textarea
                        placeholder="Enter your comment..."
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                    />

                    <button className={styles.button} disabled={!session?.user}>Send comment</button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>All comments</h2>

                {comments.length === 0 && (
                    <span>No comments found...</span>
                )}

                {comments.map((item) => (
                    <article className={styles.comment} key={item.id}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={() => handleDeletComment(item.id)}><FaTrash size={18} color="#EA3140"/></button>
                            )}
                        </div>
                        <p>{item.comment}</p>

                        
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ( { params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tarefas", id);

    const q = query(collection(db, "comments"), where("taskId", "==", id)); //Aqui estou assessando os comentários que é igual ao id da tarefa na qual estamos comentando

    const snapshotComments = await getDocs(q);

    let allComments: CommentProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        })
    });

    const snapshot = await getDoc(docRef);

    if(snapshot.data() === undefined){
        return{
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    if(!snapshot.data()?.public){
        return{
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return{
        props: {
            item: task,
            allComments: allComments,
        }
    }
} //Como já haviamos coletado as tarefas em uma página passada, nao tem necessidade de criarmos um useEffect para mostrar os detalhes dela, podemos apenas criar pelo servidor.