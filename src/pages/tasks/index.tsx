import styles from "./styles.module.css";

import { GetServerSideProps } from "next";
import { db } from "@/services/firebaseConnection";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

interface TaskProps{
    item: {
        tarefa: string;
        public: boolean;
        created: string;
        user: string;
        taskId: string;
    }[]
}

export default function Tasks({ item } : TaskProps){
    return(
        <div className={styles.containerTasks}>
            {item?.map((p) => (
                <div key={p?.taskId} className={styles.tasks}>

                    <div className={styles.infos}>
                        <p className={styles.tarefa}>{p?.tarefa}</p>
                        <div className={styles.owner}>
                            <p className={styles.userLabel}>User:</p>
                            <span className={styles.userOwner}>{p.user}</span>
                        </div>
                    </div>

                    <Link href={`/task/${p.taskId}`} className={styles.buttonComments}>See all comments</Link>
                </div>
            ))}
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async () => {
    const tarefasRef = collection(db, "tarefas");

    // Filtra apenas tarefas públicas
    const q = query(tarefasRef, where("public", "==", true));
    const querySnapshot = await getDocs(q);

    // Converte para array de objetos
    const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();

        return {
        taskId: doc.id,
        tarefa: data.tarefa,
        public: data.public,
        user: data.user,
        created: data.created.toDate().toISOString(),
        };
    });

    // Se não houver tarefas públicas, redireciona
    if (tasks.length === 0) {
        return {
        redirect: {
            destination: "/",
            permanent: false,
        }
        };
    }

    return{
        props:{
            item: tasks
        }
    }    
}