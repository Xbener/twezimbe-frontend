import React from 'react'

type Props = {}

function Error({ }: Props) {
    return (
        <div className='w-full fixed h-full text-[2rem] flex place-content-center'>
            <h1>Oops Something Went Wrong. Please Referesh page</h1>
        </div>
    )
}

export default Error