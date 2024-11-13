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
    const [faqs, setFaqs] = useState<FAQ[]>([
        {
            "question": "What is Twezimbe about?",
            "answer": "Twezimbe is a community-focused platform designed to support group interactions, social contributions, and shared events in a structured, accessible way. With a setup to empower community networking. Twezimbe enables users to join or create groups, communicate through chat, organize events, save and invest, crowd fundraise and manage unique services like the Bereavement Fund and Family Tree. The platform is ideal for groups, organizations, and communities looking to streamline their interactions and strengthen member engagement.",
        },
        {
            "question": "How do I create a group on Twezimbe?",
            "answer": "Go to the Groups section. Click on Create Group. Enter your group’s details, such as name, description, and group type. Customize group privacy settings (Public or Private) based on who you want to have access. Add members by inviting them via email or WhatsApp or by sharing the group link. Click Create to finalize your group setup.",
        },
        {
            "question": "How do I invite people to my group?",
            "answer": "Once your group is created, go to your group’s Members tab. Click on Invite Members and either enter email addresses or copy the group link to share with potential members.",
        },
        {
            "question": "Can I join a group without an invitation?",
            "answer": "Public groups are open for any user to join by clicking Join Group on the group page. Private groups require an invitation from the group admin.",
        },
        {
            "question": "How do I enroll in the Bereavement Fund?",
            "answer": "Navigate to the Bereavement Fund section in your group. Click on Enroll in Bereavement Fund. Fill out your profile details and add beneficiaries (family members or dependents who will receive benefits). Select your contribution plan (monthly or yearly) and make your first payment to activate your enrollment.",
        },
        {
            "question": "Can I enroll in the Bereavement Fund without joining a group?",
            "answer": "Currently, enrollment in the Bereavement Fund is available through groups. You will need to join a group that has the Bereavement Fund option enabled.",
        },
        {
            "question": "How do I add beneficiaries?",
            "answer": "After enrolling in the Bereavement Fund, go to Manage Beneficiaries within your profile. Click on Add Beneficiary and provide details such as name, relationship, and contact information.",
        },
        {
            "question": "What happens when there’s a bereavement case?",
            "answer": "When a bereavement case is activated, you’ll receive a notification with details about the contribution needed. You can contribute through your wallet or preferred payment method linked to your profile.",
        }
    ]
    )

    useEffect(() => {
        const getData = async () => {
            const res = await getFaqs()
            setFaqs(prev => res)
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
