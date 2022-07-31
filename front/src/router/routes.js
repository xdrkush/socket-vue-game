const routes = [
    {
        path: "/",
        component: () => import("../layouts/MainLayout.vue"),
        children: [
            { path: "", component: () => import("../components/home.vue") },
            {
                path: "p4", component: () => import("../components/puissance4"),
                children: [
                    { path: ":name", component: () => import("../components/puissance4/game.vue") }
                ]
            },
        ]
    },
    {
        path: "/game",
        component: () => import("../layouts/GameLayout.vue"),
        children: [
            {
                path: ":game",
                children: [
                    { path: ":id/:name", component: () => import("../components/puissance4/game.vue") }
                ]
            },
        ]
    },
]

export default routes;