
import { useContext, useState } from "react";
import { QuestionContext } from "../contexts/questionContext";
import { ProductContext } from "../contexts/productContext";

function AdminQuestions() {
    const { products } = useContext(ProductContext);
    const { questions, answerQuestion } = useContext(QuestionContext);
    const [answers, setAnswers] = useState({});

    const handleSubmit = (id) => {
        if (!answers[id]?.trim()) return;

        answerQuestion(id, answers[id].trim());

        setAnswers((prev) => ({
            ...prev,
            [id]: "",
        }));
    };

    return (
        <div className="admin-questions">
            <h2>Customer Questions</h2>

            {questions.length === 0 ? (
                <p>No questions submitted yet.</p>
            ) : (
                questions.map((question) => {
                    const product = products.find(
                        (item) => item.id === question.productId
                    );

                    return (
                        <div key={question.id} className="admin-question-card">
                            <h3>{question.userName}</h3>

                            <p>
                                <strong>Product:</strong>{" "}
                                {product ? product.name : "Product not found"}
                            </p>
                            <img src={product.image} alt={product.name} style={{ width: "100px", height: "100px" }} />
                            <p>{question.question}</p>

                            {question.answer && (
                                <p><strong>Current answer:</strong> {question.answer}</p>
                            )}

                            <textarea
                                value={answers[question.id] || ""}
                                onChange={(e) =>
                                    setAnswers((prev) => ({
                                        ...prev,
                                        [question.id]: e.target.value,
                                    }))
                                }
                                placeholder="Write your answer..."
                            />

                            <button onClick={() => handleSubmit(question.id)}>
                                {question.answer ? "Update Answer" : "Submit Answer"}
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default AdminQuestions;
