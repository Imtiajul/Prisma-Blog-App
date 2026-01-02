import app from "./app";
import {prisma} from "./lib/prisma"

const PORT = process.env.PORT || 5005;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connect to the database successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })

    } catch (error) {
            console.error("An error Occured:", error);
            await prisma.$disconnect();
            process.exit(1);
    }
}

main()