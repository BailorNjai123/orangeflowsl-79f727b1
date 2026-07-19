# OrangeFlow SL

## Design and Implementation of a Role‑Based, Offline‑Capable Progressive Web Application for the Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows

---

**A Dissertation Submitted to the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone, in Partial Fulfilment of the Requirements for the Award of the Degree of Bachelor of Engineering (Honours) in Electrical and Electronic Engineering**

By

**[Author Full Name]**
Registration Number: **[Registration Number]**

Supervisor: **[Supervisor's Name and Title]**

**[Month, Year]**

---

## Declaration

I hereby declare that this dissertation, titled *"Design and Implementation of a Role‑Based, Offline‑Capable Progressive Web Application for the Orchestration of Base Transceiver Station (BTS) Site Rollout Workflows"*, is the result of my own original work carried out under the supervision of **[Supervisor's Name]** in the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone. All sources of information consulted have been duly acknowledged by means of references. This work has not been submitted, either in whole or in part, for any other degree or professional qualification at this or any other institution.

Signed: ______________________________     Date: __________________

**[Author Full Name]**

---

## Certification

This is to certify that this dissertation was carried out by **[Author Full Name]** of the Department of Electrical and Electronic Engineering, Fourah Bay College, University of Sierra Leone, under my supervision, and has been approved for submission in partial fulfilment of the requirements for the award of the degree of Bachelor of Engineering (Honours) in Electrical and Electronic Engineering.

Signed: ______________________________     Date: __________________

**[Supervisor's Name and Title]**
Project Supervisor

Signed: ______________________________     Date: __________________

**[Head of Department]**
Head, Department of Electrical and Electronic Engineering

Signed: ______________________________     Date: __________________

**External Examiner**

---

## Dedication

This dissertation is dedicated to my family, whose unwavering support and sacrifice made this journey possible, and to every field engineer whose daily effort keeps Sierra Leone connected.

---

## Acknowledgements

I gratefully acknowledge my supervisor, **[Supervisor's Name]**, for the guidance, patience and academic rigour that shaped this work. I thank the lecturers and technical staff of the Department of Electrical and Electronic Engineering, Fourah Bay College, for the foundation on which this project was built. I extend appreciation to the operational teams whose insight into the BTS rollout workflow informed the requirements captured in this study, and to my classmates, friends and family for their steady encouragement throughout the project.

---

## Abstract

The rollout of Base Transceiver Station (BTS) sites in Sierra Leone has historically been coordinated through printed forms, disparate spreadsheets and informal messaging channels. This fragmented workflow produces silent data loss, weak audit trails, poor field usability and no real‑time visibility for supervisors — deficiencies that directly delay network expansion and inflate operational cost. This dissertation presents the design, implementation and evaluation of **OrangeFlow SL**, a role‑based, mobile‑first Progressive Web Application (PWA) that consolidates the BTS site rollout lifecycle into a single auditable digital pipeline.

The system was engineered using an applied, design‑science methodology combining descriptive process modelling, constructive software engineering and evaluative testing. A three‑tier architecture was adopted: a React 18, Vite and TypeScript client tier delivered as an installable PWA with offline capture through an IndexedDB action queue; a middleware tier of JWT‑authenticated PostgREST endpoints and privileged Deno Edge Functions; and a data tier built on a PostgreSQL database secured by Row‑Level Security and two private object‑storage buckets. Three domain roles — Planning Team, Procurement Team and Project Administrator — are enforced through a dedicated `user_roles` table and security‑definer helpers that prevent privilege escalation.

Verification through role‑based end‑to‑end scenarios, migration‑level security audits and responsive testing demonstrated that OrangeFlow SL enforces least‑privilege access, preserves data integrity under intermittent connectivity, and materially improves auditability, throughput and supervisory oversight relative to the incumbent manual process.

---

## Table of Contents

- Declaration
- Certification
- Dedication
- Acknowledgements
- Abstract
- List of Figures
- List of Tables
- List of Abbreviations

**Chapter One — Introduction**
1.1 Background of the Study
1.2 Statement of the Problem
1.3 Aim and Objectives
1.4 Research Questions
1.5 Significance of the Study
1.6 Scope and Limitations
1.7 Organisation of the Dissertation

**Chapter Two — Literature Review**
2.1 Introduction
2.2 Overview of Telecommunications Site Rollout Workflows
2.3 Traditional Versus Digital Coordination Systems
2.4 Progressive Web Applications and Offline‑First Design
2.5 Role‑Based Access Control and Row‑Level Security
2.6 Secure Object Storage and Signed URL Delivery
2.7 Review of Existing and Adjacent Systems
2.8 Research Gap
2.9 Chapter Summary

**Chapter Three — Research Methodology**
3.1 Introduction
3.2 Research Design
3.3 Data Collection Methods
3.4 Analysis of the Existing System
3.5 Proposed System (OrangeFlow SL)
3.6 Functional Requirements
3.7 Non‑Functional Requirements
3.8 System Architecture
3.9 Database Design
3.10 Use Case Diagram
3.11 Activity Diagram
3.12 System Flowchart
3.13 Entity Relationship Diagram
3.14 Software Development Methodology
3.15 Technologies Used
3.16 Testing Strategy
3.17 Chapter Summary

**Chapter Four — System Implementation**
4.1 Introduction
4.2 System Overview
4.3 Authentication and Session Management
4.4 Role Assignment and Access Control
4.5 Planning Module — Site Submission
4.6 Procurement Module — Nine‑Point Checklist
4.7 Administrative Pipeline Control
4.8 Notifications and Activity Log
4.9 Offline Capture and Synchronisation
4.10 User Interface and Responsive Design
4.11 Administrative User Management via Edge Function
4.12 Challenges Encountered and Solutions Adopted
4.13 Chapter Summary

**Chapter Five — Results and Discussion**
5.1 Introduction
5.2 Functional Verification
5.3 Security Verification
5.4 Offline and Synchronisation Behaviour
5.5 Responsive and Cross‑Device Behaviour
5.6 Comparison with the Prior Manual Workflow
5.7 Discussion
5.8 Chapter Summary

**Chapter Six — Conclusion and Recommendations**
6.1 Summary of the Study
6.2 Conclusion
6.3 Contribution to Knowledge
6.4 Recommendations for Future Work

**References**
