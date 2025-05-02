import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import illusiaImage from "@/assets/illusiaImage.jpg"
import { Button } from "./ui/button"

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${illusiaImage})` }}
        />
        <div className="relative h-full flex items-center justify-center bg-black/50">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg tracking-wide uppercase">
            Welcome to Illusia
          </h1>
        </div>
      </div>

      {/* Tabs Section: Product Categories */}
      <section className="px-8 max-w-6xl mx-auto mb-16">
        <Tabs defaultValue="gadgets">
        <TabsList className="grid w-full grid-cols-3 mb-6 border">
          <TabsTrigger
            className="data-[state=active]:text-secondary transition"
            value="gadgets"
          >
            Gadgets
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:text-secondary transition"
            value="costumes"
          >
            Costumes
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:text-secondary transition"
            value="furniture"
          >
            Furniture
          </TabsTrigger>
        </TabsList>

          {/* TODO: Update the Card with ProductPreviewCard to show actual info, currently just fake hard coded info */}
          {/* Tab Content: Gadgets */}
          <TabsContent value="gadgets">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Energy Beacon</h3>
                <p className="text-gray-600">LED-based prop to simulate magical energy sources.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Magic Communicator</h3>
                <p className="text-gray-600">Crystal-powered walkie-talkie for immersive LARP missions.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Energy Beacon</h3>
                <p className="text-gray-600">LED-based prop to simulate magical energy sources.</p>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Content: Costumes */}
          <TabsContent value="costumes">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Witch King's Robe</h3>
                <p className="text-gray-600">Intimidating full-body outfit, includes headdress and cloak.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Forest Scout Gear</h3>
                <p className="text-gray-600">Stealthy and practical gear for woodland adventures.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Witch King's Robe</h3>
                <p className="text-gray-600">Intimidating full-body outfit, includes headdress and cloak.</p>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Content: Furniture */}
          <TabsContent value="furniture">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Throne of Elders</h3>
                <p className="text-gray-600">Large ornate chair, perfect for a royal or elder NPC.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Market Stall Set</h3>
                <p className="text-gray-600">Tables, crates, and awnings for immersive trading scenes.</p>
              </Card>
              <Card className="p-4 shadow-md">
                {/* Image Section */}
                <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center rounded">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>
                <h3 className="font-semibold text-xl">Throne of Elders</h3>
                <p className="text-gray-600">Large ornate chair, perfect for a royal or elder NPC.</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Call to Action */}
      <div className="bg-secondary text-white py-10 text-center mb-20">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to level up your next LARP?</h2>
        <p className="mb-6">Browse our gear, reserve online, and bring your world to life.</p>
        <Button 
          onClick={() => window.location.href = "/storage"}
          className="bg-white text-secondary font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition">
          View Products
        </Button>
      </div>

      {/* FAQ Section */}
      <section className="w-full max-w-xl px-4 sm:px-6 md:px-8 mx-auto mb-20">
        <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          
          <AccordionItem value="q1" className="w-full">
            <AccordionTrigger className="w-full text-left">
              Do you deliver to LARP event locations?
            </AccordionTrigger>
            <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
              Yes! We offer delivery and pickup options for most major LARP events in Finland.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q2" className="w-full">
            <AccordionTrigger className="w-full text-left">
              Can I reserve items in advance?
            </AccordionTrigger>
            <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
              Absolutely. We recommend booking at least 2 weeks before your event to ensure availability.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q3" className="w-full">
            <AccordionTrigger className="w-full text-left">
              What happens if something breaks?
            </AccordionTrigger>
            <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
              Accidents happen. We assess damage case by case. Some wear is expected, malicious damage may incur fees.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q4" className="w-full">
            <AccordionTrigger className="w-full text-left">
              Some other question?
            </AccordionTrigger>
            <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="q5" className="w-full">
            <AccordionTrigger className="w-full text-left">
              Lorem Ipsum?
            </AccordionTrigger>
            <AccordionContent className="w-full text-base text-gray-700 whitespace-pre-wrap break-words">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente magni placeat sed dolorem impedit voluptates iure possimus odit quam illum omnis ipsum, earum, reiciendis blanditiis itaque esse quidem porro vero.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </section>

    </div>
  )
}

export default LandingPage;