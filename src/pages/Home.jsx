import React from 'react';
import Navbar from '../components/Navbar';
import Illustration from '../assets/Animation2.json'
import Lottie from 'lottie-react';
import '../index.css'


const Home = () => {
  return (
    <div className='bg-gray-900 text-white flex flex-col items-center justify-center'>
      <div className='grid grid-cols-2 space-x-10 h-screen'>
        <div className='w-full mb-8 items-center'>
          <div className=" w-[350px] lg:w-full lg:max-w-[550px] h-auto mx-auto">
            <Lottie animationData={Illustration} loop={true} />
            <button className='text-2xl text-center poppins-regular'>
              Get Started
            </button>
          </div>
        </div>  
        <div className='mt-52'>
          <h1 className='font-ultra text-7xl mb-4 text-with-glow'>Welcome to <span className="text-[#ff4d25]">ALES</span></h1>
          <p className='text-xl font-light text-wrap w-10/12 text-left poppins-regular'>
            A platform for sharing articles, discussing coffee, and connecting with like-minded individuals.
          </p>
        </div>
      </div>
      <div>
        <h1 className='poppins-regular mt-10 font-extralight'>
          Publish Your Article in BlockChain,
          Grab Your OwnerShip
        </h1>
      </div>
    </div>
  );
}

export default Home;
