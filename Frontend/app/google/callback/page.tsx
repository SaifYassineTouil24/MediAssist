"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

function CallbackHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code")
            if (!code) {
                toast({
                    title: "Erreur",
                    description: "Aucun code d'autorisation trouvé",
                    variant: "destructive",
                })
                router.push("/dashboard")
                return
            }

            try {
                const response = await apiClient.handleGoogleCallback(code)
                if (response.success) {
                    toast({
                        title: "Succès",
                        description: "Compte Google connecté avec succès",
                    })
                    const returnTo = localStorage.getItem("google_sync_return_to") || "/dashboard"
                    router.push(returnTo)
                } else {
                    toast({
                        title: "Erreur",
                        description: response.message || "Échec de la connexion Google",
                        variant: "destructive",
                    })
                    router.push("/dashboard")
                }
            } catch (err) {
                console.error("Error handling Google callback:", err)
                router.push("/dashboard")
            } finally {
                setLoading(false)
            }
        }

        handleCallback()
    }, [searchParams, router, toast])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Connexion à Google...</h2>
                <p className="text-gray-600">Veuillez patienter pendant que nous finalisons la configuration.</p>
            </div>
        </div>
    )
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackHandler />
        </Suspense>
    )
}
