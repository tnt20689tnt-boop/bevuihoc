import {useCallback,useEffect,useState} from "react";
import {supabase} from "@/integrations/supabase/client";
import type {Book,Grade,Subject} from "@/game/types";
export type Loan={id:string;book_id:string;borrowed_at:string;due_at:string;returned_at:string|null;status:"borrowed"|"returned"|"overdue"};
export function useLibrary(grade:Grade|null){
 const [books,setBooks]=useState<Book[]>([]),[loans,setLoans]=useState<Loan[]>([]),[loading,setLoading]=useState(true);
 const refreshBooks=useCallback(async()=>{let query=supabase.from("library_books").select("id,title,subject,grade,color,cover_url,file_url,description,total_copies,available_copies").eq("is_active",true);if(grade!==null)query=query.eq("grade",grade);const {data,error}=await query.order("sort_order").order("title");if(error)throw error;setBooks((data??[]).filter(b=>["math","viet","english"].includes(b.subject)).map(b=>({...b,subject:b.subject as Subject,grade:b.grade as Grade})));},[grade]);
 const refreshLoans=useCallback(async()=>{const {data:u}=await supabase.auth.getUser();if(!u.user){setLoans([]);return;}const {data,error}=await supabase.from("book_loans").select("id,book_id,borrowed_at,due_at,returned_at,status").eq("user_id",u.user.id).is("returned_at",null);if(!error&&data)setLoans(data as Loan[]);},[]);
 useEffect(()=>{let live=true;setLoading(true);Promise.all([refreshBooks(),refreshLoans()]).catch(e=>console.error("[library]",e)).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[refreshBooks,refreshLoans]);
 const borrowBook=useCallback(async(id:string)=>{const {error}=await supabase.rpc("borrow_library_book",{p_book_id:id});if(error)throw error;await Promise.all([refreshBooks(),refreshLoans()]);},[refreshBooks,refreshLoans]);
 const returnBook=useCallback(async(id:string)=>{const {error}=await supabase.rpc("return_library_book",{p_loan_id:id});if(error)throw error;await Promise.all([refreshBooks(),refreshLoans()]);},[refreshBooks,refreshLoans]);
 return {books,loans,loading,borrowBook,returnBook,refreshBooks,refreshLoans};
}