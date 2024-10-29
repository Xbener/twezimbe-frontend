import React from 'react';

type Props = {};

function BereavementFundHero({ }: Props) {
  return (
    <section className="bg-white text-black px-6 py-12 md:px-16 lg:px-24">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center justify-between space-y-8 md:space-y-0">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
            Bereavement Fund Support
          </h1>
          <p className="text-lg text-gray-700">
            Providing financial assistance to help cover unexpected costs during difficult times.
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <button className="bg-orange-500 text-white py-2 px-6 rounded-md hover:bg-orange-600 transition duration-200">
              Get Started
            </button>
            <button className="border-2 border-blue-800 text-blue-800 py-2 px-6 rounded-md hover:bg-blue-800 hover:text-white transition duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="flex-1">
          <div className="w-full h-64 md:h-80 bg-gray-300 rounded-lg shadow-lg flex items-center justify-center relative">
            {/* <span className="text-gray-500 text-lg">Image Placeholder</span> */}
            <img
            src={'/hero-photo-bf.jpg'}
            className="w-full h-full absolute left-0 top-0 object-cover rounded-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BereavementFundHero;
