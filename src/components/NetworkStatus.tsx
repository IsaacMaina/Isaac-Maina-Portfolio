import { motion } from 'framer-motion';
import useNetworkStatus from '@/hooks/useNetworkStatus';

const NetworkStatus = () => {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-[72px] left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4"
      >
        <div className="bg-red-600 text-white py-3 px-4 rounded-lg shadow-lg flex items-center justify-center">
          <svg 
            className="w-5 h-5 mr-2 animate-pulse" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <span className="font-medium">No internet connection</span>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default NetworkStatus;