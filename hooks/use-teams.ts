"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { MyTeamsResponse } from "@/app/api/teams/route"
import type { CreatorSearchResult } from "@/app/api/creators/search/route"
import type {
  TeamMemberRow,
  PendingInvite,
} from "@/app/api/teams/[teamId]/members/route"
import type { TeamActivityRow } from "@/app/api/teams/[teamId]/activity/route"

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Request failed")
  return body as T
}

function jsonPost<T>(url: string, body?: Record<string, unknown>): Promise<T> {
  return jsonFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  })
}

export function useMyTeams() {
  return useQuery({
    queryKey: ["my-teams"],
    queryFn: () => jsonFetch<MyTeamsResponse>("/api/teams"),
  })
}

export function useCreatorSearch(q: string) {
  return useQuery({
    queryKey: ["creator-search", q],
    queryFn: () =>
      jsonFetch<{ creators: CreatorSearchResult[] }>(
        `/api/creators/search?q=${encodeURIComponent(q)}`
      ),
    enabled: q.trim().length >= 2,
  })
}

export type TeamMembersResponse = {
  members: TeamMemberRow[]
  invitations: PendingInvite[]
  myRole: "owner" | "admin" | "member"
}

export function useTeamMembers(teamId?: string | null) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => jsonFetch<TeamMembersResponse>(`/api/teams/${teamId}/members`),
    enabled: Boolean(teamId),
  })
}

export function useTeamActivity(teamId?: string | null) {
  return useQuery({
    queryKey: ["team-activity", teamId],
    queryFn: () =>
      jsonFetch<{ activity: TeamActivityRow[] }>(`/api/teams/${teamId}/activity`),
    enabled: Boolean(teamId),
  })
}

export function useSendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { handle: string; role: "admin" | "member"; teamId?: string }) =>
      jsonPost("/api/teams/invitations", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-teams"] })
      qc.invalidateQueries({ queryKey: ["team-members"] })
    },
  })
}

export function useRespondInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { invitationId: string; action: "accept" | "decline" }) =>
      jsonPost<{ status: string; teamId?: string }>(
        `/api/teams/invitations/${input.invitationId}/respond`,
        { action: input.action }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-teams"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useRevokeInvite(teamId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) =>
      jsonFetch(`/api/teams/invitations/${invitationId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members", teamId] }),
  })
}

export function useUpdateMember(teamId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      memberId: string
      role?: "admin" | "member"
      canExport?: boolean
    }) =>
      jsonFetch(`/api/teams/${teamId}/members/${input.memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: input.role, canExport: input.canExport }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members", teamId] }),
  })
}

export function useRemoveMember(teamId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) =>
      jsonFetch(`/api/teams/${teamId}/members/${memberId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members", teamId] }),
  })
}
