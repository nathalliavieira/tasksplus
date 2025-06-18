import { HTMLProps } from "react";
import styles from "./styles.module.css";

export function Textarea( {...rest }: HTMLProps<HTMLTextAreaElement>){
    return <textarea className={styles.textarea} {...rest}></textarea>
} //Essa configuracao de passar o ...rest e definir o tipo me permite que eu faça as modificacoes que eu quiser, por exemplo: em uma página pode ser um placeholder escrito "digite sua tarefa" e em outra página diferente pode ser do tipo "digite seu comentário"