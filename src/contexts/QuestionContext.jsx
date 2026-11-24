
import { useState, useEffect } from "react";
import { QuestionContext } from "./questionContext";

function QuestionProvider({ children }) {
    const [questions, setQuestions] = useState(() => {
        const savedQuestions = localStorage.getItem("questions");
        return savedQuestions ? JSON.parse(savedQuestions) : [];
    });

    useEffect(() => {
        localStorage.setItem("questions", JSON.stringify(questions));
    }, [questions]);

    const addQuestion = (question) => {
        setQuestions((prev) => [...prev, question]);
    };

    const answerQuestion = (id, answer) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === id
                    ? { ...question, answer }
                    : question
            )
        );
    };

    return (
        <QuestionContext.Provider
            value={{ questions, addQuestion, answerQuestion }}
        >
            {children}
        </QuestionContext.Provider>
    );
}

export default QuestionProvider;
