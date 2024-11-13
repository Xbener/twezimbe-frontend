'use client'
import { getFaqs } from '@/api/inquries';
import { FAQ } from '@/types';
import { useEffect, useState } from 'react';

interface FaqItem {
    question: string;
    answer: string;
}


const Faq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<FAQ[]>([])

    useEffect(() => {
        const getData = async () => {
            const res = await getFaqs()
            setFaqs(res)
        }
        getData()
    }, [])
    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-2xl mx-auto my-8 p-4">
            <h2 className="text-2xl font-semibold mb-4 text-center">Frequently Asked Questions</h2>
            <ul>
                {faqs.map((item, index) => (
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
