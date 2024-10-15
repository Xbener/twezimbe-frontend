import React from 'react'
import PacmanLoader from 'react-spinners/PacmanLoader'

type Props = {}

function MainLoader({ }: Props) {
    return (
        <div
            className='w-full fixed h-full grid place-content-center'
        >
            <PacmanLoader color={"#013A6FFF"} />
        </div>
    )
}

export default MainLoader