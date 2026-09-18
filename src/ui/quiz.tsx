import "./quiz.css";
import { useState } from "react";
import type { QuizQuestion } from "../types.ts";
import { quizAnswerIsCorrect } from "../career.ts";

export interface QuizProps {
  questions: QuizQuestion[];
  /** Host: progression.complete(locationId). */
  onSolved: () => void;
  /** Host: progression.closeChallenge(). */
  onDone: () => void;
}

/**
 * The pure, presentational quiz Challenge: the questions presented one at a
 * time in order, gentle handling of wrong picks, each question's optional
 * note rendered after it is answered, and `onSolved()` called exactly once
 * when every question is answered correctly.
 *
 * Dumb by contract — all data in via props, all action out via the
 * callbacks. No progression, no career reads, no keyboard handling
 * (native button focus + Enter already covers accessibility).
 */
export function Quiz(props: QuizProps) {
  const { questions, onSolved, onDone } = props;
  // Questions are answered strictly in order, so the count of answered
  // questions IS the index of the current one.
  const [solvedCount, setSolvedCount] = useState(0);
  // question index → rejected option indices (dimmed, disabled, retryable
  // by the remaining options — the challenge is always solvable).
  const [rejected, setRejected] = useState<Record<number, number[]>>({});
  const [solved, setSolved] = useState(false);

  const total = questions.length;

  const pick = (qIndex: number, optionIndex: number) => {
    const question = questions[qIndex];
    if (!question) return;
    if (quizAnswerIsCorrect(question, optionIndex)) {
      setSolvedCount(qIndex + 1);
      if (qIndex + 1 >= total) {
        // The last question, answered correctly: solve, exactly once.
        setSolved(true);
        onSolved();
      }
    } else {
      setRejected((prev) => ({
        ...prev,
        [qIndex]: [...(prev[qIndex] ?? []), optionIndex],
      }));
    }
  };

  if (solved) {
    return (
      <div className="quiz">
        <div className="quiz-solved">
          That's the whole of it — the block is yours.
        </div>
        <button className="quiz-done" type="button" onClick={onDone}>
          Done
        </button>
      </div>
    );
  }

  const answered = questions.slice(0, solvedCount);
  const current = questions[solvedCount];
  const currentRejections = rejected[solvedCount] ?? [];

  return (
    <div className="quiz">
      <div className="quiz-progress">
        {`Question ${solvedCount + 1} of ${total}`}
      </div>
      {answered.map((question, i) => (
        <div key={i} className="quiz-question quiz-question-answered">
          <div
            className="quiz-question-text"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
          <div className="quiz-options">
            {question.options.map((option, j) => (
              <button
                key={j}
                type="button"
                className={
                  j === question.answer
                    ? "quiz-option quiz-option-correct"
                    : "quiz-option"
                }
                disabled
                dangerouslySetInnerHTML={{ __html: option }}
              />
            ))}
          </div>
          {question.note ? (
            <div
              className="quiz-note"
              dangerouslySetInnerHTML={{ __html: question.note }}
            />
          ) : null}
        </div>
      ))}
      {current ? (
        <div className="quiz-question">
          <div
            className="quiz-question-text"
            dangerouslySetInnerHTML={{ __html: current.question }}
          />
          <div className="quiz-options">
            {current.options.map((option, j) => (
              <button
                key={j}
                type="button"
                className={
                  currentRejections.includes(j)
                    ? "quiz-option quiz-option-rejected"
                    : "quiz-option"
                }
                disabled={currentRejections.includes(j)}
                onClick={() => pick(solvedCount, j)}
                dangerouslySetInnerHTML={{ __html: option }}
              />
            ))}
          </div>
          {currentRejections.length > 0 ? (
            <div className="quiz-rejection">Not quite — try again.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
