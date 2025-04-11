import { Card } from "@/components/ui/card";
import illusiaImage from '@/assets/illusiaImage.jpg';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex">
    {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Hero Banner */}
        <div className="relative h-96">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${illusiaImage})` }}
          />
          {/* <div className="relative h-full flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Welcome to ILLUSIA
            </h1>
          </div> */}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <Card className="max-w-8xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Featured Content</h2>
            <p className="text-gray-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequatur perspiciatis atque perferendis, sint asperiores ut doloribus expedita temporibus. Autem minus inventore corporis quae deserunt delectus tenetur labore incidunt! Id, adipisci.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat est labore et dolorem provident veritatis eos ea aut, assumenda sunt fugit laborum corporis unde distinctio aspernatur dolorum perferendis omnis cupiditate!
            </p>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-[#9537C7] text-white py-6 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p>&copy; 2024 Illusia. All rights reserved.</p>
          </div>
        </footer>
      </div>
  </div>
  )
}

export default LandingPage