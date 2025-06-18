import Head from "next/head"; //O head é para poder estilizar
import styles from "@/styles/home.module.css";
import Image from "next/image"; //O Image é um recurso do next.js que nos ajuda a otimizar a nossa imagem, fazer ela carregar mais rápido e etc..

import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";  //Usamos isso para criar páginas estáticas, cujo a informacao nao tem tanta relevancia ao ponto de termos que atualizar a todo momento. Nesse caso sao os numeros de tarefas + comentários.

import { collection, getDocs } from "firebase/firestore";

import { db } from "@/services/firebaseConnection";

interface HomeProps{
  posts: number;
  comments: number;
}

export default function Home({posts, comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tasks+</title>
      </Head>
      
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tasks+"
            src={heroImg}
            priority
          /> {/* priority é para priorizar o carregamento da nossa imagem */}
        </div>

        <h1 className={styles.title}>System designed for you to organize <br/> your studies and tasks</h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comments</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  //Buscar do banco os números e mandar pro componente:

  //Primeiro os comentários:
  const commentRef = collection(db, "comments");
  const commentSnapshot = await getDocs(commentRef);

  //Agora os posts:
  const postRef = collection(db, "tarefas");
  const postShanpshot = await getDocs(postRef);

  return{
    props: {
      posts: postShanpshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60 //a página seria revalidada a cada 60s. Se nao passarmos nada, ela só é revalidada uma única vez.
  }
}
