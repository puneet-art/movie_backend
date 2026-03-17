import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to seed database...');

    // Seeding Actors
    const actor1 = await prisma.actor.create({
        data: {
            first_name: 'Tom',
            last_name: 'Hanks',
            location: 'Concord, CA, USA',
        },
    });

    const actor2 = await prisma.actor.create({
        data: {
            first_name: 'Leonardo',
            last_name: 'DiCaprio',
            location: 'Los Angeles, CA, USA',
        },
    });

    const actor3 = await prisma.actor.create({
        data: {
            first_name: 'Morgan',
            last_name: 'Freeman',
            location: 'Memphis, TN, USA',
        },
    });

    console.log(`Created Actors: 3`);

    // Seeding Films
    const film1 = await prisma.film.create({
        data: {
            title: 'Forrest Gump',
            description: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
            release_year: 1994,
        },
    });

    const film2 = await prisma.film.create({
        data: {
            title: 'Inception',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
            release_year: 2010,
        },
    });

    const film3 = await prisma.film.create({
        data: {
            title: 'The Shawshank Redemption',
            description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
            release_year: 1994,
        },
    });

    console.log(`Created Films: 3`);

    console.log('Database seeding finished completely.');
}

main()
    .catch((e) => {
        console.error('Error while seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
