import streamlit as st
from utils import llama
st.set_page_config(page_title="Physics and Chemistry Problem Solver", page_icon="🔬", layout="centered")
st.markdown("""
<style>
body
{
    background-color: #f0f4f8;
    color: #1e1e1e;
}
.stApp > header 
{
    background-color: #e0e8f0;
    border-bottom: 1px solid #c0d0e0;
}
h1
{
    color: #2c3e50;
    font-weight: 600;
}
h3
{
    color: #34495e;
}
.sidebar .sidebar-content 
{
    background-color: #e8f0f8;
}
.stButton > button
{
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    transition: background-color 0.3s ease;
}
.stButton > button:hover
{
    background-color: #2980b9;
}
.stTextArea > div > div > textarea
{
    border: 1px solid #bdc3c7;
    border-radius: 4px;
    background-color: #ffffff;
}
.stSuccess
{
    background-color: #e8f8f0;
    border: 1px solid #a3e0c1;
    border-radius: 4px;
    padding: 0.5rem;
}
.stError 
{
    background-color: #fae2e2;
    border: 1px solid #f5b7b1;
    border-radius: 4px;
    padding: 0.5rem;
}
.stSpinner > div
{
    border-top-color: #3498db !important;
}
footer
{
    border-top: 1px solid #c0d0e0;
    padding-top: 1rem;
    margin-top: 2rem;
    font-size: 0.8rem;
    color: #7f8c8d;
}
</style>
""", unsafe_allow_html=True)
role = """
Act as a great professor who is extraordinarily expert in 
Science, technology, engineering, and mathematics.
Now you should help the user solve physics and chemistry problems STEP BY STEP
and help them in enhancing their conceptual understanding in that particular concept.
Now the user will be giving you the questions and you have to solve them accordingly.
"""
st.title("🔬 Physics and Chemistry Problem Solver")
st.write("Get step-by-step solutions to complex physics and chemistry problems.")
with st.sidebar:
    st.header("Instructions")
    st.write("""
        1. Enter your physics or chemistry problem in the text area.
        2. The AI will generate a detailed step-by-step solution.
        3. Use this tool to enhance your understanding of core concepts.
        """)
    st.write("📚 This tool helps you learn by breaking down solutions to improve your conceptual knowledge.")
st.subheader("📝 Enter your problem below:")
ques = st.text_area("Enter the problem question:")
if st.button("Solve"):
    if ques:
        with st.spinner('Generating solution...'):
            prompt = f"""
            context={role},
            Now generate me the answer of the given problem "{ques}" as per your role ("{role}").
            """
            result = llama(prompt)
        st.success("### Solution:")
        st.write(result)
    else:
        st.error("Please enter a problem in the text area.")
st.write("------")
st.write("🔍 Powered by AI to help you solve STEM problems efficiently and enhance your understanding.")