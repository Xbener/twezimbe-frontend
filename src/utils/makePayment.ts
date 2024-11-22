import { toast } from "sonner";
import { makeContribution, updateWalletBalance } from "@/lib/bf";
import { BF, User } from "@/types";
import { FlutterWaveButton, closePaymentModal, useFlutterwave } from "flutterwave-react-v3";

export async function makePayment(payForm: any, currentUser: User, personal_wallet: boolean, walletAddress: string, contribute_case?: string) {
    console.log(walletAddress)
    if (personal_wallet) {
        if (payForm.type === "contribution") {
            await makeContribution({ walletAddress, amount: payForm.data.amount, contributor: currentUser?._id!, contribute_case: contribute_case!, wallet: currentUser.wallet?.walletAddress })
        } else {
            await updateWalletBalance({ userId: currentUser?._id!, walletAddress, amount: parseFloat(payForm.data.amount), wallet: currentUser.wallet?.walletAddress })
        }
        return
    }
    if (payForm.data.amount !== "" && payForm.data.amount !== "0") {


        const handleFlutterwavePayment = useFlutterwave({
            amount: payForm.data.amount,
            currency: "UGX",
            public_key: "FLWPUBK_TEST-61fd8c76063ac4c81570ea26a682c719-X",
            customer: {
                email: currentUser?.email,
                phone_number: `${payForm.data.countryCode}${payForm.data.phone}`,
                name: `${currentUser?.firstName} ${currentUser?.lastName}`,
            },
            meta: {
                source: "docs-inline-test",
                consumer_mac: "92a3-912ba-1192a",

            },
            tx_ref: "txref-DI0NzMx13",
            payment_options: "mobilemoneyrwanda, mobilemoneyuganda",
            customizations: {
                title: payForm.type === "deposit" ? "Deposit funds" : "Make contribution",
                description: payForm.type === "contribution" ? "Add amount and account info to make a contribution " : "Add funds to your wallet",
                logo: "https://checkout.flutterwave.com/assets/img/rave-logo.png",
            },

        })

        handleFlutterwavePayment({
            callback: async (e: any) => {
                if (e.status === 'successful') {
                    if (payForm.type === "contribution") {
                        await makeContribution({ walletAddress, amount: payForm.data.amount, contributor: currentUser?._id!, contribute_case: contribute_case! })
                    } else {
                        await updateWalletBalance({ userId: currentUser?._id!, walletAddress, amount: parseFloat(payForm.data.amount) })
                    }

                    console.log("paid successfully", e)
                    closePaymentModal();
                }
            },
            onClose: () => {
                console.log("Payment closed without completing");
            },
        })

        // FlutterwaveCheckout({
        //     public_key: "FLWPUBK_TEST-61fd8c76063ac4c81570ea26a682c719-X",
        //     tx_ref: "txref-DI0NzMx13",
        //     amount: payForm.data.amount,
        //     currency: "RWF",
        //     payment_options: "mobilemoneyrwanda, mobilemoneyuganda",
        //     meta: {
        //         source: "docs-inline-test",
        //         consumer_mac: "92a3-912ba-1192a",
        //     },
        //     customer: {
        //         email: currentUser?.email,
        //         phone_number: `${payForm.data.countryCode}${payForm.data.phone}`,
        //         name: `${currentUser?.firstName} ${currentUser?.lastName}`,
        //     },
        //     customizations: {
        //         title: payForm.type === "deposit" ? "Deposit funds" : "Make contribution",
        //         description: payForm.type === "contribution" ? "Add amount and account info to make a contribution " : "Add funds to your Bereavement Fund",
        //         logo: "https://checkout.flutterwave.com/assets/img/rave-logo.png",
        //     },
        //     callback: async (e: any) => {
        //         if (e.status === 'successful') {
        //             if (payForm.type === "contribution") {
        //                 await makeContribution({ walletAddress: groupBF?.walletAddress!, amount: payForm.data.amount, contributor: currentUser?._id!, contribute_case: contribute_case! })
        //             } else {
        //                 await updateWalletBalance({ userId: currentUser?._id!, walletAddress: groupBF?.wallet?.walletAddress!, amount: parseFloat(payForm.data.amount) })
        //             }

        //         }
        //         console.log("paid successfully", e)

        //     },
        //     onclose: function () {
        //         console.log("Payment cancelled!");
        //     }
        // });
    } else {
        toast.error("Enter the required info to make a payment")
    }
}