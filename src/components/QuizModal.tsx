import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, Award, HelpCircle, ArrowRight } from 'lucide-react';
import { sounds } from '../services/sound';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  questions: QuizQuestion[];
  onCorrectAnswer: (coinsAwarded: number) => void;
  onClose: () => void;
  rewardCoins: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  questions,
  onCorrectAnswer,
  onClose,
  rewardCoins
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  if (!currentQ) {
    return null;
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sounds.playQuizCorrect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      sounds.playQuizWrong();
    }
  };

  const handleNextOrFinish = () => {
    if (isCorrect) {
      onCorrectAnswer(rewardCoins);
      onClose();
    } else {
      // Pick another question or reset
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
      } else {
        // Loop back
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#18092b] border-2 border-[#ff2a85] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-500/20 text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#00f5d4]" />
            <h3 className="font-display font-bold text-xl text-white">
              도전! 학교 상식 퀴즈
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/70">
            문제 {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question Text */}
        <div className="bg-[#24103f] p-4 sm:p-5 rounded-2xl mb-5 border border-white/10">
          <p className="text-lg sm:text-xl font-bold leading-relaxed text-yellow-300">
            Q. {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-6">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isThisCorrect = idx === currentQ.correctIndex;

            let btnStyle = 'bg-white/10 hover:bg-white/20 text-white border-white/10';
            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'bg-emerald-600/90 text-white border-emerald-400 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-rose-600/80 text-white border-rose-400';
              } else {
                btnStyle = 'bg-white/5 text-white/40 border-transparent';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 text-left rounded-xl border flex items-center justify-between transition-all select-none ${btnStyle} ${
                  !isAnswered ? 'cursor-pointer active:scale-99' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-base font-medium">{option}</span>
                </div>

                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                )}
                {isAnswered && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-rose-300 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div
            className={`p-4 rounded-xl mb-5 flex flex-col gap-2 ${
              isCorrect ? 'bg-emerald-950/60 border border-emerald-500/40' : 'bg-rose-950/60 border border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-emerald-300">정답입니다! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="font-bold text-rose-300">아쉽지만 오답이에요!</span>
                </>
              )}
            </div>
            {currentQ.explanation && (
              <p className="text-xs text-white/80 leading-relaxed pl-7">
                {currentQ.explanation}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            닫기 (나중에 풀기)
          </button>

          {isAnswered && (
            <button
              type="button"
              onClick={handleNextOrFinish}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${
                isCorrect
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span>{isCorrect ? `동전 ${rewardCoins}개 받고 뽑기하러 가기!` : '다음 문제 도전하기'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
