'use client'
import { useState } from 'react';

interface FaqItem {
    question: string;
    answer: string;
}

const faqData: FaqItem[] = [
    {
        question: 'What is your return policy?',
        answer: 'You can return any item within 30 days of purchase for a full refund.',
    },
    {
        question: 'How do I track my order?',
        answer: 'Once your order is shipped, you will receive an email with a tracking link.',
    },
    {
        question: 'Do you ship internationally?',
        answer: 'Yes, we offer worldwide shipping to most countries.',
    },
];

const Faq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-2xl mx-auto my-8 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-center">Frequently Asked Questions</h2>
            <ul>
                {faqData.map((item, index) => (
                    <li key={index} className="border-b border-gray-300 py-4">
                        <button
                            onClick={() => toggleFaq(index)}
                            className="w-full text-left text-lg font-medium flex justify-between items-center"
                        >
                            <span>{item.question}</span>
                            <span>{openIndex === index ? '-' : '+'}</span>
                        </button>
                        {openIndex === index && (
                            <p className="mt-2 text-gray-600">{item.answer}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Faq;
